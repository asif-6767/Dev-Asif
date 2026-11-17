<?php
declare(strict_types=1);

/**
 * ASIF ISLAM — Security, Session, CSRF, Encryption & Rate-Limiting Helpers
 */

if (!defined('ASIF_APP')) {
    http_response_code(403);
    exit('Direct access forbidden.');
}

function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
        (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
        (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    );

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');

    session_name('ASIF_SESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();

    // Regenerate session ID periodically (every 30 minutes)
    if (!isset($_SESSION['_last_regen'])) {
        $_SESSION['_last_regen'] = time();
    } elseif (time() - (int)$_SESSION['_last_regen'] > 1800) {
        session_regenerate_id(true);
        $_SESSION['_last_regen'] = time();
    }
}

/**
 * HTML output escaping helper
 */
function e(?string $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Sanitize URL safely (only allows http, https, mailto, tel, or relative assets/ paths)
 */
function safeUrl(?string $url): string
{
    $url = trim((string)$url);
    if ($url === '') {
        return '';
    }
    if (str_starts_with($url, '#') || str_starts_with($url, '/') || str_starts_with($url, 'assets/')) {
        return $url;
    }
    $scheme = parse_url($url, PHP_URL_SCHEME);
    if ($scheme !== null && in_array(strtolower($scheme), ['http', 'https', 'mailto', 'tel'], true)) {
        return $url;
    }
    return '';
}

/**
 * Validate external/local image URL safely
 */
function safeImageUrl(?string $url, string $fallback = 'assets/images/asif-islam.jpg'): string
{
    $cleaned = safeUrl($url);
    if ($cleaned === '') {
        return $fallback;
    }
    return $cleaned;
}

/**
 * Generate or return current session CSRF token
 */
function getCsrfToken(): string
{
    startSecureSession();
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
    return (string)$_SESSION['_csrf_token'];
}

function verifyCsrfToken(?string $token): bool
{
    startSecureSession();
    if (empty($_SESSION['_csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals((string)$_SESSION['_csrf_token'], (string)$token);
}

/**
 * Hash client IP so raw IPs aren't unnecessarily stored while still enabling rate limiting
 */
function getClientIpHash(): string
{
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
    if (str_contains($ip, ',')) {
        $parts = explode(',', $ip);
        $ip = trim($parts[0]);
    }
    return hash_hmac('sha256', $ip, APP_SECRET_KEY);
}

/**
 * Encrypt sensitive secrets (like external AI API keys) before storing in MySQL
 */
function encryptSecret(string $plaintext): string
{
    $plaintext = trim($plaintext);
    if ($plaintext === '') {
        return '';
    }
    if (!function_exists('openssl_encrypt')) {
        return 'b64:' . base64_encode($plaintext);
    }
    $key = hash('sha256', APP_SECRET_KEY, true);
    $iv = random_bytes(16);
    $cipher = openssl_encrypt($plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    if ($cipher === false) {
        throw new RuntimeException('Unable to encrypt secret.');
    }
    $hmac = hash_hmac('sha256', $iv . $cipher, $key, true);
    return 'enc:' . base64_encode($iv . $hmac . $cipher);
}

/**
 * Decrypt stored API secret on the server only (never return plaintext to public frontend)
 */
function decryptSecret(?string $stored): string
{
    $stored = trim((string)$stored);
    if ($stored === '') {
        return '';
    }
    if (str_starts_with($stored, 'b64:')) {
        return (string)base64_decode(substr($stored, 4));
    }
    if (!str_starts_with($stored, 'enc:') || !function_exists('openssl_decrypt')) {
        return '';
    }
    $raw = base64_decode(substr($stored, 4), true);
    if ($raw === false || strlen($raw) < 49) {
        return '';
    }
    $key = hash('sha256', APP_SECRET_KEY, true);
    $iv = substr($raw, 0, 16);
    $hmac = substr($raw, 16, 32);
    $cipher = substr($raw, 48);
    $expectedHmac = hash_hmac('sha256', $iv . $cipher, $key, true);
    if (!hash_equals($hmac, $expectedHmac)) {
        return '';
    }
    $plain = openssl_decrypt($cipher, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    return $plain === false ? '' : $plain;
}

/**
 * Admin session guard
 */
function isAdminLoggedIn(): bool
{
    startSecureSession();
    if (empty($_SESSION['admin_user_id']) || empty($_SESSION['admin_username'])) {
        return false;
    }
    // 2 hour inactivity timeout
    if (!empty($_SESSION['admin_last_active']) && (time() - (int)$_SESSION['admin_last_active'] > 7200)) {
        logoutAdminSession();
        return false;
    }
    $_SESSION['admin_last_active'] = time();
    return true;
}

function requireAdminAuth(): void
{
    if (!isAdminLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function logoutAdminSession(): void
{
    startSecureSession();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    session_destroy();
}

/**
 * Login rate limit check (max 5 failed attempts in 15 minutes)
 */
function checkLoginRateLimit(PDO $pdo, string $ipHash): array
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) AS fail_count, MAX(attempted_at) AS last_attempt
         FROM login_attempts
         WHERE ip_hash = ? AND success = 0 AND attempted_at >= (NOW() - INTERVAL 15 MINUTE)'
    );
    $stmt->execute([$ipHash]);
    $row = $stmt->fetch();
    $fails = (int)($row['fail_count'] ?? 0);
    return [
        'allowed' => $fails < 5,
        'fails'   => $fails,
    ];
}

function recordLoginAttempt(PDO $pdo, string $ipHash, string $username, bool $success): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO login_attempts (ip_hash, username, success, attempted_at) VALUES (?, ?, ?, NOW())'
    );
    $stmt->execute([$ipHash, substr($username, 0, 80), $success ? 1 : 0]);
}

/**
 * Clean JSON response helper
 */
function sendJsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
