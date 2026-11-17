<?php
declare(strict_types=1);

/**
 * ASIF ISLAM — Database Data Fetchers & Public Configuration Helpers
 */

if (!defined('ASIF_APP')) {
    http_response_code(403);
    exit('Direct access forbidden.');
}

function getAllSiteSettings(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT setting_key, setting_value FROM site_settings');
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    return $settings;
}

function setting(array $settings, string $key, string $default = ''): string
{
    return isset($settings[$key]) && $settings[$key] !== '' ? (string)$settings[$key] : $default;
}

function getActiveBanners(PDO $pdo, bool $onlyActive = true): array
{
    $sql = $onlyActive
        ? 'SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        : 'SELECT * FROM banners ORDER BY display_order ASC, id ASC';
    return $pdo->query($sql)->fetchAll();
}

function getJourneyMilestones(PDO $pdo, bool $onlyActive = true): array
{
    $sql = $onlyActive
        ? 'SELECT * FROM journey_milestones WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        : 'SELECT * FROM journey_milestones ORDER BY display_order ASC, id ASC';
    return $pdo->query($sql)->fetchAll();
}

function getServicesWithFeatures(PDO $pdo, bool $onlyActive = true): array
{
    $sql = $onlyActive
        ? 'SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        : 'SELECT * FROM services ORDER BY display_order ASC, id ASC';
    $services = $pdo->query($sql)->fetchAll();

    if (empty($services)) {
        return [];
    }

    $featuresStmt = $pdo->query('SELECT * FROM service_features ORDER BY display_order ASC, id ASC');
    $featureMap = [];
    foreach ($featuresStmt->fetchAll() as $feat) {
        $sid = (int)$feat['service_id'];
        $featureMap[$sid][] = $feat['feature_text'];
    }

    foreach ($services as &$service) {
        $sid = (int)$service['id'];
        $service['features'] = $featureMap[$sid] ?? [];
        $platforms = json_decode((string)$service['platforms_json'], true);
        $service['platforms'] = is_array($platforms) ? $platforms : [];
    }

    return $services;
}

function getSocialLinks(PDO $pdo, bool $onlyActive = true): array
{
    $sql = $onlyActive
        ? 'SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        : 'SELECT * FROM social_links ORDER BY display_order ASC, id ASC';
    return $pdo->query($sql)->fetchAll();
}

function getAiSettings(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT * FROM ai_settings WHERE id = 1 LIMIT 1');
    $row = $stmt->fetch();
    if (!$row) {
        return [
            'is_enabled'               => 1,
            'mode'                     => 'builtin',
            'assistant_name'           => "ASIF'S ASSISTANT",
            'welcome_message'          => "Hello! I'm Asif's Assistant. How can I help you explore his digital services and learn more about his journey?",
            'system_instructions'      => '',
            'fallback_message'         => "I don't have confirmed information about that yet. Please contact Asif directly for clarification.",
            'off_topic_message'        => "I'm Asif's website assistant. I can help you with information about Asif Islam, his journey, digital services, and support options.",
            'api_provider'             => 'openai_compatible',
            'api_endpoint'             => 'https://api.openai.com/v1/chat/completions',
            'model_name'               => 'gpt-4o-mini',
            'api_key_encrypted'        => '',
            'suggested_questions_json' => '[]',
            'rate_limit_per_minute'    => 15,
        ];
    }
    return $row;
}

function getAiPublicConfig(PDO $pdo): array
{
    $ai = getAiSettings($pdo);
    $suggested = json_decode((string)($ai['suggested_questions_json'] ?? '[]'), true);
    if (!is_array($suggested)) {
        $suggested = [];
    }
    // NEVER return api_key_encrypted, api_endpoint, or system_instructions to public frontend
    return [
        'enabled'             => (int)$ai['is_enabled'] === 1,
        'assistant_name'      => (string)$ai['assistant_name'],
        'welcome_message'     => (string)$ai['welcome_message'],
        'suggested_questions' => array_values(array_filter(array_map('strval', $suggested))),
    ];
}

function sanitizeHexColor(string $color, string $fallback = '#00E5FF'): string
{
    $color = trim($color);
    if (preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
        return strtoupper($color);
    }
    return $fallback;
}

function getAdminCount(PDO $pdo): int
{
    try {
        return (int)$pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    } catch (Throwable $e) {
        return 0;
    }
}
