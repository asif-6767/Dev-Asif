<?php
declare(strict_types=1);

define('ASIF_APP', true);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/ai_engine.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$raw = file_get_contents('php://input');
$data = json_decode((string)$raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

// Verify CSRF token if provided via session page
$csrf = (string)($data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
if (!verifyCsrfToken($csrf)) {
    sendJsonResponse(['ok' => false, 'error' => 'Session token expired. Please refresh the page.'], 403);
}

$message = trim((string)($data['message'] ?? ''));
if ($message === '') {
    sendJsonResponse(['ok' => false, 'error' => 'Please enter a message.'], 422);
}

if (mb_strlen($message, 'UTF-8') > 600) {
    sendJsonResponse(['ok' => false, 'error' => 'Message is too long (maximum 600 characters).'], 422);
}

try {
    $pdo = getDbConnection();
    $aiSettings = getAiSettings($pdo);
    $rateLimit = (int)($aiSettings['rate_limit_per_minute'] ?? 15);
    $ipHash = getClientIpHash();

    if (!checkAiRateLimit($pdo, $ipHash, $rateLimit)) {
        sendJsonResponse([
            'ok'    => false,
            'error' => 'Too many requests in a short time. Please wait a moment and try again.',
        ], 429);
    }

    $result = handleAssistantMessage($pdo, $message);
    if (!$result['ok']) {
        sendJsonResponse($result, 403);
    }

    sendJsonResponse([
        'ok'    => true,
        'reply' => $result['reply'],
        'mode'  => $result['mode'],
        'time'  => gmdate('H:i'),
    ]);
} catch (Throwable $e) {
    error_log('Chat API error: ' . $e->getMessage());
    sendJsonResponse([
        'ok'    => false,
        'error' => 'Unable to process your question right now. Please try again shortly.',
    ], 500);
}
