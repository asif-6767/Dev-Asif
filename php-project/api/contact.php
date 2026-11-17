<?php
declare(strict_types=1);

define('ASIF_APP', true);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$raw = file_get_contents('php://input');
$data = json_decode((string)$raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$csrf = (string)($data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
if (!verifyCsrfToken($csrf)) {
    sendJsonResponse(['ok' => false, 'error' => 'Security verification failed. Please reload and try again.'], 403);
}

// Honeypot spam trap
$honeypot = trim((string)($data['website_url'] ?? ''));
if ($honeypot !== '') {
    sendJsonResponse(['ok' => false, 'error' => 'Submission rejected by spam protection.'], 400);
}

// Timing check (prevent instant bot submissions < 2s after page render if supplied)
$formRenderedAt = (int)($data['form_ts'] ?? 0);
if ($formRenderedAt > 0 && (time() - $formRenderedAt) < 2) {
    sendJsonResponse(['ok' => false, 'error' => 'Please take a moment before submitting the form.'], 429);
}

$fullName        = trim(strip_tags((string)($data['full_name'] ?? '')));
$email           = trim((string)($data['email'] ?? ''));
$preferredMethod = trim(strip_tags((string)($data['preferred_method'] ?? 'WhatsApp')));
$serviceCategory = trim(strip_tags((string)($data['service_category'] ?? 'Website Development')));
$message         = trim(strip_tags((string)($data['message'] ?? '')));

if ($fullName === '' || mb_strlen($fullName, 'UTF-8') < 2 || mb_strlen($fullName, 'UTF-8') > 120) {
    sendJsonResponse(['ok' => false, 'error' => 'Please enter a valid full name (2–120 characters).'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 160) {
    sendJsonResponse(['ok' => false, 'error' => 'Please enter a valid email address.'], 422);
}

$allowedMethods = ['WhatsApp', 'Email', 'Telegram'];
if (!in_array($preferredMethod, $allowedMethods, true)) {
    $preferredMethod = 'WhatsApp';
}

if ($serviceCategory === '' || mb_strlen($serviceCategory, 'UTF-8') > 120) {
    $serviceCategory = 'Website Development';
}

if ($message === '' || mb_strlen($message, 'UTF-8') < 10 || mb_strlen($message, 'UTF-8') > 2000) {
    sendJsonResponse(['ok' => false, 'error' => 'Please enter a message between 10 and 2000 characters.'], 422);
}

// Prevent email header injection characters in short metadata
$safeSubjectName = str_replace(["\r", "\n"], '', $fullName);
$safeEmail = str_replace(["\r", "\n"], '', $email);

try {
    $pdo = getDbConnection();
    $settings = getAllSiteSettings($pdo);
    $ipHash = getClientIpHash();

    // Duplicate & rapid-submit guard (same IP + same message hash within 60 seconds)
    $msgCheck = $pdo->prepare(
        'SELECT id FROM contact_messages
         WHERE ip_hash = ? AND created_at >= (NOW() - INTERVAL 60 SECOND)
         LIMIT 1'
    );
    $msgCheck->execute([$ipHash]);
    if ($msgCheck->fetch()) {
        sendJsonResponse([
            'ok'    => false,
            'error' => 'A message was just submitted from your connection. Please wait 60 seconds before sending another.',
        ], 429);
    }

    $insert = $pdo->prepare(
        'INSERT INTO contact_messages (full_name, email, preferred_method, service_category, message, ip_hash, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, "new", NOW())'
    );
    $insert->execute([$safeSubjectName, $safeEmail, $preferredMethod, $serviceCategory, $message, $ipHash]);

    $contactEmail = setting($settings, 'contact_email', '');
    $whatsappRaw = preg_replace('/\D+/', '', setting($settings, 'contact_whatsapp', ''));
    $telegramLink = safeUrl(setting($settings, 'contact_telegram', ''));
    $phpMailEnabled = setting($settings, 'contact_enable_php_mail', '0') === '1';

    $formattedText = "Hello Asif,\n"
        . "Name: {$safeSubjectName}\n"
        . "Email: {$safeEmail}\n"
        . "Preferred Contact: {$preferredMethod}\n"
        . "Service: {$serviceCategory}\n"
        . "Message: {$message}";

    $whatsappUrl = '';
    if ($whatsappRaw !== '' && setting($settings, 'contact_enable_whatsapp', '1') === '1') {
        $whatsappUrl = 'https://wa.me/' . $whatsappRaw . '?text=' . rawurlencode($formattedText);
    }

    $mailtoUrl = '';
    if ($contactEmail !== '' && filter_var($contactEmail, FILTER_VALIDATE_EMAIL) && setting($settings, 'contact_enable_email_mailto', '1') === '1') {
        $mailtoUrl = 'mailto:' . $contactEmail
            . '?subject=' . rawurlencode("Website Inquiry: {$serviceCategory} — {$safeSubjectName}")
            . '&body=' . rawurlencode($formattedText);
    }

    $phpMailSent = false;
    if ($phpMailEnabled && $contactEmail !== '' && filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
        $mailSubject = "New Inquiry from {$safeSubjectName} ({$serviceCategory})";
        $headers = "From: ASIF ISLAM Website <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n"
            . "Reply-To: {$safeEmail}\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n";
        $phpMailSent = @mail($contactEmail, $mailSubject, $formattedText, $headers);
    }

    sendJsonResponse([
        'ok'           => true,
        'message'      => setting($settings, 'contact_success_message', 'Your inquiry has been saved. Use the direct link below to continue on your preferred platform.'),
        'whatsapp_url' => $whatsappUrl,
        'mailto_url'   => $mailtoUrl,
        'telegram_url' => $telegramLink,
        'php_mail'     => $phpMailSent,
    ]);
} catch (Throwable $e) {
    error_log('Contact API error: ' . $e->getMessage());
    sendJsonResponse([
        'ok'    => false,
        'error' => 'Could not record your message. Please verify database setup or try direct social links.',
    ], 500);
}
