<?php
declare(strict_types=1);

define('ASIF_APP', true);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../includes/functions.php';

startSecureSession();
requireAdminAuth();

$pdo = getDbConnection();
$csrfToken = getCsrfToken();
$flashSuccess = '';
$flashError = '';

/**
 * Helper to upsert multiple keys into site_settings safely
 */
function upsertSettings(PDO $pdo, array $pairs, string $group): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO site_settings (setting_key, setting_value, setting_group, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_group = VALUES(setting_group), updated_at = NOW()'
    );
    foreach ($pairs as $k => $v) {
        $stmt->execute([(string)$k, (string)$v, $group]);
    }
}

// Handle POST Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = (string)($_POST['csrf_token'] ?? '');
    if (!verifyCsrfToken($token)) {
        $flashError = 'Security verification failed. Please reload and try again.';
    } else {
        $action = (string)($_POST['action'] ?? '');
        try {
            switch ($action) {
                case 'save_general':
                    upsertSettings($pdo, [
                        'site_title'       => trim((string)($_POST['site_title'] ?? '')),
                        'brand_name'       => trim((string)($_POST['brand_name'] ?? 'ASIF ISLAM')),
                        'logo_text'        => trim((string)($_POST['logo_text'] ?? 'ASIF ISLAM')),
                        'site_description' => trim((string)($_POST['site_description'] ?? '')),
                        'browser_title'    => trim((string)($_POST['browser_title'] ?? '')),
                        'favicon_url'      => trim((string)($_POST['favicon_url'] ?? '')),
                        'footer_text'      => trim((string)($_POST['footer_text'] ?? '')),
                    ], 'general');
                    $flashSuccess = 'General settings updated.';
                    break;

                case 'save_profile':
                    upsertSettings($pdo, [
                        'profile_name'         => trim((string)($_POST['profile_name'] ?? 'Asif Islam')),
                        'profile_image_url'    => trim((string)($_POST['profile_image_url'] ?? '')),
                        'profile_location'     => trim((string)($_POST['profile_location'] ?? '')),
                        'profile_education'    => trim((string)($_POST['profile_education'] ?? '')),
                        'profile_started_year' => trim((string)($_POST['profile_started_year'] ?? '2024')),
                        'profile_interests'    => trim((string)($_POST['profile_interests'] ?? '')),
                        'profile_future_goal'  => trim((string)($_POST['profile_future_goal'] ?? '')),
                        'about_heading'        => trim((string)($_POST['about_heading'] ?? 'BEHIND THE DIGITAL WORLD')),
                        'profile_introduction' => trim((string)($_POST['profile_introduction'] ?? '')),
                        'about_description'    => trim((string)($_POST['about_description'] ?? '')),
                    ], 'profile');
                    $flashSuccess = 'Profile & About information updated.';
                    break;

                case 'save_hero':
                    upsertSettings($pdo, [
                        'hero_badge'             => trim((string)($_POST['hero_badge'] ?? '')),
                        'hero_heading'           => trim((string)($_POST['hero_heading'] ?? '')),
                        'hero_subtitle'          => trim((string)($_POST['hero_subtitle'] ?? '')),
                        'hero_typing_phrases'    => trim((string)($_POST['hero_typing_phrases'] ?? '')),
                        'hero_primary_btn'       => trim((string)($_POST['hero_primary_btn'] ?? '')),
                        'hero_secondary_btn'     => trim((string)($_POST['hero_secondary_btn'] ?? '')),
                        'hero_bg_image_url'      => trim((string)($_POST['hero_bg_image_url'] ?? '')),
                        'hero_profile_image_url' => trim((string)($_POST['hero_profile_image_url'] ?? '')),
                        'hero_visible'           => isset($_POST['hero_visible']) ? '1' : '0',
                    ], 'hero');
                    $flashSuccess = 'Hero section updated.';
                    break;

                case 'add_banner':
                    $stmt = $pdo->prepare(
                        'INSERT INTO banners (title, subtitle, image_url, destination_link, button_text, display_order, is_active)
                         VALUES (?, ?, ?, ?, ?, ?, ?)'
                    );
                    $stmt->execute([
                        trim((string)($_POST['title'] ?? 'New Banner')),
                        trim((string)($_POST['subtitle'] ?? '')),
                        trim((string)($_POST['image_url'] ?? 'assets/images/banner-web.svg')),
                        trim((string)($_POST['destination_link'] ?? '')),
                        trim((string)($_POST['button_text'] ?? 'Explore')),
                        (int)($_POST['display_order'] ?? 1),
                        isset($_POST['is_active']) ? 1 : 0,
                    ]);
                    $flashSuccess = 'Banner added.';
                    break;

                case 'update_banner':
                    $stmt = $pdo->prepare(
                        'UPDATE banners SET title=?, subtitle=?, image_url=?, destination_link=?, button_text=?, display_order=?, is_active=? WHERE id=?'
                    );
                    $stmt->execute([
                        trim((string)($_POST['title'] ?? '')),
                        trim((string)($_POST['subtitle'] ?? '')),
                        trim((string)($_POST['image_url'] ?? '')),
                        trim((string)($_POST['destination_link'] ?? '')),
                        trim((string)($_POST['button_text'] ?? 'Explore')),
                        (int)($_POST['display_order'] ?? 1),
                        isset($_POST['is_active']) ? 1 : 0,
                        (int)($_POST['id'] ?? 0),
                    ]);
                    $flashSuccess = 'Banner updated.';
                    break;

                case 'delete_banner':
                    $pdo->prepare('DELETE FROM banners WHERE id = ?')->execute([(int)($_POST['id'] ?? 0)]);
                    $flashSuccess = 'Banner deleted.';
                    break;

                case 'add_milestone':
                    $stmt = $pdo->prepare(
                        'INSERT INTO journey_milestones (year_label, title, description, display_order, is_active)
                         VALUES (?, ?, ?, ?, ?)'
                    );
                    $stmt->execute([
                        trim((string)($_POST['year_label'] ?? '2026')),
                        trim((string)($_POST['title'] ?? '')),
                        trim((string)($_POST['description'] ?? '')),
                        (int)($_POST['display_order'] ?? 1),
                        isset($_POST['is_active']) ? 1 : 0,
                    ]);
                    $flashSuccess = 'Journey milestone added.';
                    break;

                case 'update_milestone':
                    $stmt = $pdo->prepare(
                        'UPDATE journey_milestones SET year_label=?, title=?, description=?, display_order=?, is_active=? WHERE id=?'
                    );
                    $stmt->execute([
                        trim((string)($_POST['year_label'] ?? '')),
                        trim((string)($_POST['title'] ?? '')),
                        trim((string)($_POST['description'] ?? '')),
                        (int)($_POST['display_order'] ?? 1),
                        isset($_POST['is_active']) ? 1 : 0,
                        (int)($_POST['id'] ?? 0),
                    ]);
                    $flashSuccess = 'Journey milestone updated.';
                    break;

                case 'delete_milestone':
                    $pdo->prepare('DELETE FROM journey_milestones WHERE id = ?')->execute([(int)($_POST['id'] ?? 0)]);
                    $flashSuccess = 'Journey milestone deleted.';
                    break;

                case 'add_service':
                    $pdo->beginTransaction();
                    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', trim((string)($_POST['title'] ?? 'service'))));
                    $slug = trim($slug, '-') . '-' . random_int(100, 999);
                    $platforms = array_values(array_filter(array_map('trim', explode(',', (string)($_POST['platforms_csv'] ?? '')))));
                    $stmt = $pdo->prepare(
                        'INSERT INTO services (service_number, slug, icon_key, title, short_description, full_description, platforms_json, contact_button_text, display_order, is_active)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                    );
                    $stmt->execute([
                        trim((string)($_POST['service_number'] ?? '07')),
                        $slug,
                        trim((string)($_POST['icon_key'] ?? 'sparkles')),
                        trim((string)($_POST['title'] ?? '')),
                        trim((string)($_POST['short_description'] ?? '')),
                        trim((string)($_POST['full_description'] ?? '')),
                        json_encode($platforms),
                        trim((string)($_POST['contact_button_text'] ?? 'Request This Service')),
                        (int)($_POST['display_order'] ?? 7),
                        isset($_POST['is_active']) ? 1 : 0,
                    ]);
                    $newId = (int)$pdo->lastInsertId();
                    $lines = preg_split("/\r\n|\n|\r/", trim((string)($_POST['features_lines'] ?? '')));
                    $featStmt = $pdo->prepare('INSERT INTO service_features (service_id, feature_text, display_order) VALUES (?, ?, ?)');
                    $ord = 1;
                    foreach ($lines as $line) {
                        $line = trim($line);
                        if ($line !== '') {
                            $featStmt->execute([$newId, $line, $ord++]);
                        }
                    }
                    $pdo->commit();
                    $flashSuccess = 'Service added.';
                    break;

                case 'update_service':
                    $sid = (int)($_POST['id'] ?? 0);
                    $pdo->beginTransaction();
                    $platforms = array_values(array_filter(array_map('trim', explode(',', (string)($_POST['platforms_csv'] ?? '')))));
                    $stmt = $pdo->prepare(
                        'UPDATE services SET service_number=?, icon_key=?, title=?, short_description=?, full_description=?, platforms_json=?, contact_button_text=?, display_order=?, is_active=? WHERE id=?'
                    );
                    $stmt->execute([
                        trim((string)($_POST['service_number'] ?? '01')),
                        trim((string)($_POST['icon_key'] ?? 'sparkles')),
                        trim((string)($_POST['title'] ?? '')),
                        trim((string)($_POST['short_description'] ?? '')),
                        trim((string)($_POST['full_description'] ?? '')),
                        json_encode($platforms),
                        trim((string)($_POST['contact_button_text'] ?? 'Request This Service')),
                        (int)($_POST['display_order'] ?? 1),
                        isset($_POST['is_active']) ? 1 : 0,
                        $sid,
                    ]);
                    $pdo->prepare('DELETE FROM service_features WHERE service_id = ?')->execute([$sid]);
                    $lines = preg_split("/\r\n|\n|\r/", trim((string)($_POST['features_lines'] ?? '')));
                    $featStmt = $pdo->prepare('INSERT INTO service_features (service_id, feature_text, display_order) VALUES (?, ?, ?)');
                    $ord = 1;
                    foreach ($lines as $line) {
                        $line = trim($line);
                        if ($line !== '') {
                            $featStmt->execute([$sid, $line, $ord++]);
                        }
                    }
                    $pdo->commit();
                    $flashSuccess = 'Service updated.';
                    break;

                case 'delete_service':
                    $pdo->prepare('DELETE FROM services WHERE id = ?')->execute([(int)($_POST['id'] ?? 0)]);
                    $flashSuccess = 'Service deleted.';
                    break;

                case 'save_social_links':
                    $ids = $_POST['social_id'] ?? [];
                    $stmt = $pdo->prepare('UPDATE social_links SET supporting_text=?, url=?, brand_color=?, display_order=?, is_active=? WHERE id=?');
                    foreach ($ids as $idx => $idVal) {
                        $idInt = (int)$idVal;
                        $stmt->execute([
                            trim((string)($_POST['supporting_text'][$idx] ?? '')),
                            trim((string)($_POST['url'][$idx] ?? '')),
                            sanitizeHexColor((string)($_POST['brand_color'][$idx] ?? '#00E5FF')),
                            (int)($_POST['display_order'][$idx] ?? ($idx + 1)),
                            isset($_POST['is_active_' . $idInt]) ? 1 : 0,
                            $idInt,
                        ]);
                    }
                    $flashSuccess = 'Social links updated.';
                    break;

                case 'save_contact_settings':
                    upsertSettings($pdo, [
                        'contact_heading'             => trim((string)($_POST['contact_heading'] ?? "LET'S CONNECT")),
                        'contact_subtitle'            => trim((string)($_POST['contact_subtitle'] ?? '')),
                        'contact_email'               => trim((string)($_POST['contact_email'] ?? '')),
                        'contact_whatsapp'            => trim((string)($_POST['contact_whatsapp'] ?? '')),
                        'contact_telegram'            => trim((string)($_POST['contact_telegram'] ?? '')),
                        'contact_enable_whatsapp'     => isset($_POST['contact_enable_whatsapp']) ? '1' : '0',
                        'contact_enable_email_mailto' => isset($_POST['contact_enable_email_mailto']) ? '1' : '0',
                        'contact_enable_php_mail'     => isset($_POST['contact_enable_php_mail']) ? '1' : '0',
                        'contact_success_message'     => trim((string)($_POST['contact_success_message'] ?? '')),
                    ], 'contact');
                    $flashSuccess = 'Contact settings updated.';
                    break;

                case 'save_ai_settings':
                    $existingAi = getAiSettings($pdo);
                    $newKey = trim((string)($_POST['api_key_new'] ?? ''));
                    $encryptedKey = (string)($existingAi['api_key_encrypted'] ?? '');
                    if ($newKey !== '') {
                        $encryptedKey = encryptSecret($newKey);
                    } elseif (isset($_POST['clear_api_key'])) {
                        $encryptedKey = '';
                    }
                    $suggestedLines = array_values(array_filter(array_map('trim', preg_split("/\r\n|\n|\r/", (string)($_POST['suggested_questions'] ?? '')))));
                    $mode = ($_POST['mode'] ?? 'builtin') === 'api' ? 'api' : 'builtin';
                    $stmt = $pdo->prepare(
                        'UPDATE ai_settings SET
                            is_enabled=?, mode=?, assistant_name=?, welcome_message=?,
                            system_instructions=?, fallback_message=?, off_topic_message=?,
                            api_provider=?, api_endpoint=?, model_name=?, api_key_encrypted=?,
                            suggested_questions_json=?, rate_limit_per_minute=?
                         WHERE id = 1'
                    );
                    $stmt->execute([
                        isset($_POST['is_enabled']) ? 1 : 0,
                        $mode,
                        trim((string)($_POST['assistant_name'] ?? "ASIF'S ASSISTANT")),
                        trim((string)($_POST['welcome_message'] ?? '')),
                        trim((string)($_POST['system_instructions'] ?? '')),
                        trim((string)($_POST['fallback_message'] ?? '')),
                        trim((string)($_POST['off_topic_message'] ?? '')),
                        trim((string)($_POST['api_provider'] ?? 'openai_compatible')),
                        trim((string)($_POST['api_endpoint'] ?? '')),
                        trim((string)($_POST['model_name'] ?? '')),
                        $encryptedKey,
                        json_encode($suggestedLines, JSON_UNESCAPED_UNICODE),
                        max(3, min(120, (int)($_POST['rate_limit_per_minute'] ?? 15))),
                    ]);
                    $flashSuccess = 'AI Assistant configuration saved.';
                    break;

                case 'add_kb':
                    $stmt = $pdo->prepare('INSERT INTO ai_knowledge (topic, keywords, answer_text, category, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?)');
                    $stmt->execute([
                        trim((string)($_POST['topic'] ?? '')),
                        trim((string)($_POST['keywords'] ?? '')),
                        trim((string)($_POST['answer_text'] ?? '')),
                        trim((string)($_POST['category'] ?? 'general')),
                        isset($_POST['is_active']) ? 1 : 0,
                        (int)($_POST['display_order'] ?? 1),
                    ]);
                    $flashSuccess = 'Knowledge base entry added.';
                    break;

                case 'update_kb':
                    $stmt = $pdo->prepare('UPDATE ai_knowledge SET topic=?, keywords=?, answer_text=?, category=?, is_active=?, display_order=? WHERE id=?');
                    $stmt->execute([
                        trim((string)($_POST['topic'] ?? '')),
                        trim((string)($_POST['keywords'] ?? '')),
                        trim((string)($_POST['answer_text'] ?? '')),
                        trim((string)($_POST['category'] ?? 'general')),
                        isset($_POST['is_active']) ? 1 : 0,
                        (int)($_POST['display_order'] ?? 1),
                        (int)($_POST['id'] ?? 0),
                    ]);
                    $flashSuccess = 'Knowledge entry updated.';
                    break;

                case 'delete_kb':
                    $pdo->prepare('DELETE FROM ai_knowledge WHERE id = ?')->execute([(int)($_POST['id'] ?? 0)]);
                    $flashSuccess = 'Knowledge entry deleted.';
                    break;

                case 'save_appearance':
                    upsertSettings($pdo, [
                        'accent_primary'      => sanitizeHexColor((string)($_POST['accent_primary'] ?? '#00E5FF'), '#00E5FF'),
                        'accent_secondary'    => sanitizeHexColor((string)($_POST['accent_secondary'] ?? '#00FF9D'), '#00FF9D'),
                        'accent_purple'       => sanitizeHexColor((string)($_POST['accent_purple'] ?? '#8B5CF6'), '#8B5CF6'),
                        'bg_style'            => in_array($_POST['bg_style'] ?? 'cyber-grid', ['cyber-grid', 'minimal'], true) ? $_POST['bg_style'] : 'cyber-grid',
                        'animation_intensity' => in_array($_POST['animation_intensity'] ?? 'balanced', ['subtle', 'balanced', 'dynamic'], true) ? $_POST['animation_intensity'] : 'balanced',
                        'glow_intensity'      => in_array($_POST['glow_intensity'] ?? 'medium', ['low', 'medium', 'high'], true) ? $_POST['glow_intensity'] : 'medium',
                        'border_style'        => in_array($_POST['border_style'] ?? 'conic-glow', ['conic-glow', 'static-subtle'], true) ? $_POST['border_style'] : 'conic-glow',
                        'card_radius'         => (string)max(8, min(28, (int)($_POST['card_radius'] ?? 18))),
                        'show_banners'        => isset($_POST['show_banners']) ? '1' : '0',
                        'show_journey'        => isset($_POST['show_journey']) ? '1' : '0',
                        'show_about'          => isset($_POST['show_about']) ? '1' : '0',
                        'show_services'       => isset($_POST['show_services']) ? '1' : '0',
                        'show_support'        => isset($_POST['show_support']) ? '1' : '0',
                    ], 'appearance');
                    $flashSuccess = 'Appearance settings updated.';
                    break;

                case 'save_seo':
                    upsertSettings($pdo, [
                        'seo_meta_title'       => trim((string)($_POST['seo_meta_title'] ?? '')),
                        'seo_meta_description' => trim((string)($_POST['seo_meta_description'] ?? '')),
                        'seo_og_image'         => trim((string)($_POST['seo_og_image'] ?? '')),
                        'favicon_url'          => trim((string)($_POST['favicon_url'] ?? '')),
                        'seo_robots'           => trim((string)($_POST['seo_robots'] ?? 'index, follow')),
                    ], 'seo');
                    $flashSuccess = 'SEO settings updated.';
                    break;

                case 'mark_message_status':
                    $status = in_array($_POST['status'] ?? 'read', ['new', 'read', 'replied'], true) ? $_POST['status'] : 'read';
                    $pdo->prepare('UPDATE contact_messages SET status = ? WHERE id = ?')->execute([$status, (int)($_POST['id'] ?? 0)]);
                    $flashSuccess = 'Message status updated.';
                    break;

                case 'delete_message':
                    $pdo->prepare('DELETE FROM contact_messages WHERE id = ?')->execute([(int)($_POST['id'] ?? 0)]);
                    $flashSuccess = 'Message deleted.';
                    break;

                case 'export_backup':
                    $bundle = [
                        'schema_version'     => '1.0',
                        'exported_at'        => gmdate('c'),
                        'site_settings'      => $pdo->query('SELECT * FROM site_settings')->fetchAll(),
                        'banners'            => $pdo->query('SELECT * FROM banners ORDER BY display_order ASC')->fetchAll(),
                        'journey_milestones' => $pdo->query('SELECT * FROM journey_milestones ORDER BY display_order ASC')->fetchAll(),
                        'services'           => $pdo->query('SELECT * FROM services ORDER BY display_order ASC')->fetchAll(),
                        'service_features'   => $pdo->query('SELECT * FROM service_features ORDER BY display_order ASC')->fetchAll(),
                        'social_links'       => $pdo->query('SELECT * FROM social_links ORDER BY display_order ASC')->fetchAll(),
                        'ai_knowledge'       => $pdo->query('SELECT * FROM ai_knowledge ORDER BY display_order ASC')->fetchAll(),
                        'ai_settings_safe'   => $pdo->query('SELECT id, is_enabled, mode, assistant_name, welcome_message, system_instructions, fallback_message, off_topic_message, api_provider, api_endpoint, model_name, suggested_questions_json, rate_limit_per_minute FROM ai_settings WHERE id=1')->fetchAll(),
                    ];
                    $jsonOut = json_encode($bundle, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    // Also save a server copy inside .htaccess-protected /backups/
                    $backupDir = __DIR__ . '/../backups';
                    if (is_dir($backupDir) && is_writable($backupDir)) {
                        @file_put_contents($backupDir . '/backup-' . date('Ymd-His') . '.json', $jsonOut);
                    }
                    header('Content-Type: application/json; charset=UTF-8');
                    header('Content-Disposition: attachment; filename="asif-islam-backup-' . date('Y-m-d') . '.json"');
                    echo $jsonOut;
                    exit;

                case 'import_backup':
                    if (strtoupper(trim((string)($_POST['restore_confirm'] ?? ''))) !== 'RESTORE') {
                        throw new RuntimeException('Confirmation text RESTORE is required.');
                    }
                    if (empty($_FILES['backup_file']['tmp_name']) || !is_uploaded_file($_FILES['backup_file']['tmp_name'])) {
                        throw new RuntimeException('Please select a valid JSON backup file.');
                    }
                    $rawJson = file_get_contents($_FILES['backup_file']['tmp_name']);
                    $data = json_decode((string)$rawJson, true);
                    if (!is_array($data) || ($data['schema_version'] ?? '') !== '1.0' || !isset($data['site_settings'], $data['services'])) {
                        throw new RuntimeException('Invalid or incompatible backup JSON structure.');
                    }

                    $pdo->beginTransaction();
                    // Replace site_settings
                    $pdo->exec('DELETE FROM site_settings');
                    $stStmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)');
                    foreach ($data['site_settings'] as $row) {
                        $stStmt->execute([$row['setting_key'], $row['setting_value'], $row['setting_group'] ?? 'general']);
                    }
                    // Replace banners
                    if (isset($data['banners']) && is_array($data['banners'])) {
                        $pdo->exec('DELETE FROM banners');
                        $bStmt = $pdo->prepare('INSERT INTO banners (title, subtitle, image_url, destination_link, button_text, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
                        foreach ($data['banners'] as $b) {
                            $bStmt->execute([$b['title'], $b['subtitle'] ?? '', $b['image_url'], $b['destination_link'] ?? '', $b['button_text'] ?? 'Explore', (int)($b['display_order'] ?? 1), (int)($b['is_active'] ?? 1)]);
                        }
                    }
                    // Replace milestones
                    if (isset($data['journey_milestones']) && is_array($data['journey_milestones'])) {
                        $pdo->exec('DELETE FROM journey_milestones');
                        $mStmt = $pdo->prepare('INSERT INTO journey_milestones (year_label, title, description, display_order, is_active) VALUES (?, ?, ?, ?, ?)');
                        foreach ($data['journey_milestones'] as $m) {
                            $mStmt->execute([$m['year_label'], $m['title'], $m['description'], (int)($m['display_order'] ?? 1), (int)($m['is_active'] ?? 1)]);
                        }
                    }
                    // Replace services & features
                    $pdo->exec('DELETE FROM service_features');
                    $pdo->exec('DELETE FROM services');
                    $sStmt = $pdo->prepare('INSERT INTO services (id, service_number, slug, icon_key, title, short_description, full_description, platforms_json, contact_button_text, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    foreach ($data['services'] as $s) {
                        $sStmt->execute([(int)$s['id'], $s['service_number'], $s['slug'], $s['icon_key'], $s['title'], $s['short_description'], $s['full_description'], $s['platforms_json'] ?? '[]', $s['contact_button_text'] ?? 'Request', (int)($s['display_order'] ?? 1), (int)($s['is_active'] ?? 1)]);
                    }
                    if (isset($data['service_features']) && is_array($data['service_features'])) {
                        $sfStmt = $pdo->prepare('INSERT INTO service_features (service_id, feature_text, display_order) VALUES (?, ?, ?)');
                        foreach ($data['service_features'] as $sf) {
                            $sfStmt->execute([(int)$sf['service_id'], $sf['feature_text'], (int)($sf['display_order'] ?? 1)]);
                        }
                    }
                    // Replace social links
                    if (isset($data['social_links']) && is_array($data['social_links'])) {
                        $pdo->exec('DELETE FROM social_links');
                        $slStmt = $pdo->prepare('INSERT INTO social_links (platform_key, platform_name, supporting_text, url, brand_color, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
                        foreach ($data['social_links'] as $sl) {
                            $slStmt->execute([$sl['platform_key'], $sl['platform_name'], $sl['supporting_text'] ?? '', $sl['url'] ?? '', $sl['brand_color'] ?? '#00E5FF', (int)($sl['display_order'] ?? 1), (int)($sl['is_active'] ?? 1)]);
                        }
                    }
                    // Replace AI KB
                    if (isset($data['ai_knowledge']) && is_array($data['ai_knowledge'])) {
                        $pdo->exec('DELETE FROM ai_knowledge');
                        $kbStmt = $pdo->prepare('INSERT INTO ai_knowledge (topic, keywords, answer_text, category, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?)');
                        foreach ($data['ai_knowledge'] as $kb) {
                            $kbStmt->execute([$kb['topic'], $kb['keywords'], $kb['answer_text'], $kb['category'] ?? 'general', (int)($kb['is_active'] ?? 1), (int)($kb['display_order'] ?? 1)]);
                        }
                    }
                    $pdo->commit();
                    $flashSuccess = 'Backup validated and restored successfully.';
                    break;
            }
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $flashError = $e->getMessage();
        }
    }
}

$settings   = getAllSiteSettings($pdo);
$banners    = getActiveBanners($pdo, false);
$milestones = getJourneyMilestones($pdo, false);
$services   = getServicesWithFeatures($pdo, false);
$socials    = getSocialLinks($pdo, false);
$aiSettings = getAiSettings($pdo);
$kbItems    = $pdo->query('SELECT * FROM ai_knowledge ORDER BY display_order ASC, id ASC')->fetchAll();
$messages   = $pdo->query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50')->fetchAll();
$hasApiKey  = trim((string)($aiSettings['api_key_encrypted'] ?? '')) !== '';
$suggestedArr = json_decode((string)($aiSettings['suggested_questions_json'] ?? '[]'), true);
$suggestedText = is_array($suggestedArr) ? implode("\n", $suggestedArr) : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Dashboard &mdash; ASIF ISLAM</title>
    <link rel="stylesheet" href="admin.css?v=1.0.0">
</head>
<body>
<div class="admin-shell">
    <div id="sidebarBackdrop" class="sidebar-backdrop"></div>

    <aside id="adminSidebar" class="admin-sidebar">
        <div class="sidebar-brand">
            <strong>ASIF ADMIN</strong>
            <span style="font-size:.75rem;color:var(--accent-2);"><?= e($_SESSION['admin_username']) ?></span>
        </div>

        <nav class="sidebar-nav">
            <button type="button" class="nav-tab-btn is-active" data-tab="overview">Overview &amp; Inbox</button>
            <button type="button" class="nav-tab-btn" data-tab="general">A. General Settings</button>
            <button type="button" class="nav-tab-btn" data-tab="profile">B. Profile &amp; About</button>
            <button type="button" class="nav-tab-btn" data-tab="hero">C. Hero Section</button>
            <button type="button" class="nav-tab-btn" data-tab="banners">D. Banner Manager</button>
            <button type="button" class="nav-tab-btn" data-tab="journey">E. Journey Milestones</button>
            <button type="button" class="nav-tab-btn" data-tab="services">F. Services Manager</button>
            <button type="button" class="nav-tab-btn" data-tab="social">G. Social Links</button>
            <button type="button" class="nav-tab-btn" data-tab="contact">H. Contact Settings</button>
            <button type="button" class="nav-tab-btn" data-tab="ai">I. AI Assistant &amp; KB</button>
            <button type="button" class="nav-tab-btn" data-tab="appearance">J. Appearance</button>
            <button type="button" class="nav-tab-btn" data-tab="seo">K. SEO Settings</button>
            <button type="button" class="nav-tab-btn" data-tab="backup">L. Backup &amp; Restore</button>
        </nav>

        <div class="sidebar-bottom">
            <a href="../index.php" target="_blank" class="btn btn-sm">View Public Website &rarr;</a>
            <a href="logout.php" class="btn btn-danger btn-sm">Sign Out</a>
        </div>
    </aside>

    <div class="admin-main">
        <header class="admin-topbar">
            <div class="topbar-left">
                <button type="button" id="mobileMenuBtn" class="mobile-menu-btn" aria-label="Toggle sidebar">&#9776;</button>
                <h1 id="topbarTitle" class="topbar-title">Overview &amp; Inbox</h1>
            </div>
            <div class="topbar-actions">
                <a href="../index.php" class="btn btn-sm">Live Site</a>
            </div>
        </header>

        <div class="admin-content">
            <?php if ($flashSuccess !== ''): ?>
                <div class="alert alert-success"><?= e($flashSuccess) ?></div>
            <?php endif; ?>
            <?php if ($flashError !== ''): ?>
                <div class="alert alert-error"><?= e($flashError) ?></div>
            <?php endif; ?>

            <!-- OVERVIEW & INBOX -->
            <section class="tab-panel is-active" data-tab-panel="overview">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Active Services</div>
                        <div class="stat-value"><?= count(array_filter($services, fn($s) => (int)$s['is_active'] === 1)) ?></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Banners</div>
                        <div class="stat-value"><?= count($banners) ?></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">AI KB Entries</div>
                        <div class="stat-value"><?= count($kbItems) ?></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Inquiries Received</div>
                        <div class="stat-value"><?= count($messages) ?></div>
                    </div>
                </div>

                <div class="panel-card">
                    <h2>Contact Messages Inbox</h2>
                    <p class="panel-desc">Recent inquiries submitted via the Support Contact Form (up to 50 latest).</p>
                    <?php if (empty($messages)): ?>
                        <p style="color:var(--muted);">No contact messages recorded yet.</p>
                    <?php else: ?>
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Sender</th>
                                    <th>Service &amp; Method</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($messages as $msg): ?>
                                <tr>
                                    <td>
                                        <strong><?= e($msg['full_name']) ?></strong><br>
                                        <span style="color:var(--muted);font-size:.8rem;"><?= e($msg['email']) ?></span><br>
                                        <span style="color:var(--muted);font-size:.75rem;"><?= e($msg['created_at']) ?></span>
                                    </td>
                                    <td>
                                        <?= e($msg['service_category']) ?><br>
                                        <span style="color:var(--accent);font-size:.78rem;">Via <?= e($msg['preferred_method']) ?></span>
                                    </td>
                                    <td style="max-width:340px;"><?= nl2br(e($msg['message'])) ?></td>
                                    <td><?= e(strtoupper($msg['status'])) ?></td>
                                    <td>
                                        <form method="POST" style="display:inline-flex;gap:6px;flex-wrap:wrap;">
                                            <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                            <input type="hidden" name="action" value="mark_message_status">
                                            <input type="hidden" name="id" value="<?= (int)$msg['id'] ?>">
                                            <select name="status" style="background:#0A0D14;color:#F5F7FA;border:1px solid var(--border);border-radius:7px;padding:4px 6px;font-size:.78rem;">
                                                <option value="new" <?= $msg['status'] === 'new' ? 'selected' : '' ?>>New</option>
                                                <option value="read" <?= $msg['status'] === 'read' ? 'selected' : '' ?>>Read</option>
                                                <option value="replied" <?= $msg['status'] === 'replied' ? 'selected' : '' ?>>Replied</option>
                                            </select>
                                            <button type="submit" class="btn btn-sm">Update</button>
                                        </form>
                                        <form method="POST" data-confirm="Delete this message?" style="display:inline;">
                                            <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                            <input type="hidden" name="action" value="delete_message">
                                            <input type="hidden" name="id" value="<?= (int)$msg['id'] ?>">
                                            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <?php endif; ?>
                </div>
            </section>

            <!-- A. GENERAL SETTINGS -->
            <section class="tab-panel" data-tab-panel="general">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_general">
                    <h2>A. General Settings</h2>
                    <p class="panel-desc">Control core branding, navigation wordmark, favicon, and footer text.</p>
                    <div class="form-grid-2">
                        <div class="field"><label>Brand Name</label><input type="text" name="brand_name" value="<?= e(setting($settings, 'brand_name')) ?>"></div>
                        <div class="field"><label>Navbar Logo Text</label><input type="text" name="logo_text" value="<?= e(setting($settings, 'logo_text')) ?>"></div>
                        <div class="field"><label>Website Title</label><input type="text" name="site_title" value="<?= e(setting($settings, 'site_title')) ?>"></div>
                        <div class="field"><label>Browser Title</label><input type="text" name="browser_title" value="<?= e(setting($settings, 'browser_title')) ?>"></div>
                        <div class="field"><label>Favicon URL</label><input type="text" name="favicon_url" value="<?= e(setting($settings, 'favicon_url')) ?>"></div>
                        <div class="field"><label>Footer Text</label><input type="text" name="footer_text" value="<?= e(setting($settings, 'footer_text')) ?>"></div>
                    </div>
                    <div class="field"><label>Website Description</label><textarea name="site_description" rows="3"><?= e(setting($settings, 'site_description')) ?></textarea></div>
                    <button type="submit" class="btn btn-primary">Save General Settings</button>
                </form>
            </section>

            <!-- B. PROFILE MANAGEMENT -->
            <section class="tab-panel" data-tab-panel="profile">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_profile">
                    <h2>B. Profile &amp; About Section</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Full Name</label><input type="text" name="profile_name" value="<?= e(setting($settings, 'profile_name')) ?>"></div>
                        <div class="field"><label>Profile Photograph URL</label><input type="text" name="profile_image_url" value="<?= e(setting($settings, 'profile_image_url')) ?>"></div>
                        <div class="field"><label>Location</label><input type="text" name="profile_location" value="<?= e(setting($settings, 'profile_location')) ?>"></div>
                        <div class="field"><label>Education</label><input type="text" name="profile_education" value="<?= e(setting($settings, 'profile_education')) ?>"></div>
                        <div class="field"><label>Journey Starting Year</label><input type="text" name="profile_started_year" value="<?= e(setting($settings, 'profile_started_year')) ?>"></div>
                        <div class="field"><label>About Section Heading</label><input type="text" name="about_heading" value="<?= e(setting($settings, 'about_heading')) ?>"></div>
                        <div class="field"><label>Interests</label><input type="text" name="profile_interests" value="<?= e(setting($settings, 'profile_interests')) ?>"></div>
                        <div class="field"><label>Future Goal</label><input type="text" name="profile_future_goal" value="<?= e(setting($settings, 'profile_future_goal')) ?>"></div>
                    </div>
                    <div class="field"><label>Personal Introduction (used for Knowledge/Context)</label><textarea name="profile_introduction" rows="5"><?= e(setting($settings, 'profile_introduction')) ?></textarea></div>
                    <div class="field"><label>About Section Narrative</label><textarea name="about_description" rows="5"><?= e(setting($settings, 'about_description')) ?></textarea></div>
                    <button type="submit" class="btn btn-primary">Save Profile &amp; About</button>
                </form>
            </section>

            <!-- C. HERO SECTION -->
            <section class="tab-panel" data-tab-panel="hero">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_hero">
                    <h2>C. Hero Section</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Small Badge</label><input type="text" name="hero_badge" value="<?= e(setting($settings, 'hero_badge')) ?>"></div>
                        <div class="field"><label>Main Heading</label><input type="text" name="hero_heading" value="<?= e(setting($settings, 'hero_heading')) ?>"></div>
                        <div class="field"><label>Primary Button Text</label><input type="text" name="hero_primary_btn" value="<?= e(setting($settings, 'hero_primary_btn')) ?>"></div>
                        <div class="field"><label>Secondary Button Text</label><input type="text" name="hero_secondary_btn" value="<?= e(setting($settings, 'hero_secondary_btn')) ?>"></div>
                        <div class="field"><label>Hero Profile Image URL</label><input type="text" name="hero_profile_image_url" value="<?= e(setting($settings, 'hero_profile_image_url')) ?>"></div>
                        <div class="field"><label>Optional Background Image URL</label><input type="text" name="hero_bg_image_url" value="<?= e(setting($settings, 'hero_bg_image_url')) ?>"></div>
                    </div>
                    <div class="field"><label>Typing Tagline Phrases (separated by |)</label><input type="text" name="hero_typing_phrases" value="<?= e(setting($settings, 'hero_typing_phrases')) ?>"></div>
                    <div class="field"><label>Supporting Subtitle</label><textarea name="hero_subtitle" rows="3"><?= e(setting($settings, 'hero_subtitle')) ?></textarea></div>
                    <label class="checkbox-row"><input type="checkbox" name="hero_visible" <?= setting($settings, 'hero_visible', '1') === '1' ? 'checked' : '' ?>> Display Hero Section on Public Website</label>
                    <button type="submit" class="btn btn-primary">Save Hero Section</button>
                </form>
            </section>

            <!-- D. BANNER MANAGEMENT -->
            <section class="tab-panel" data-tab-panel="banners">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="add_banner">
                    <h2>D. Add Banner Slide (via Image URL)</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Banner Title</label><input type="text" name="title" required></div>
                        <div class="field"><label>Image URL</label><input type="text" name="image_url" placeholder="https://... or assets/images/banner-web.svg" required></div>
                        <div class="field"><label>Destination Link (Optional)</label><input type="text" name="destination_link" placeholder="#services or https://..."></div>
                        <div class="field"><label>Button Text</label><input type="text" name="button_text" value="Explore"></div>
                        <div class="field"><label>Display Order</label><input type="number" name="display_order" value="<?= count($banners) + 1 ?>"></div>
                    </div>
                    <div class="field"><label>Subtitle</label><input type="text" name="subtitle"></div>
                    <label class="checkbox-row"><input type="checkbox" name="is_active" checked> Active</label>
                    <button type="submit" class="btn btn-primary">Add Banner</button>
                </form>

                <div class="panel-card">
                    <h2>Existing Banners</h2>
                    <div class="item-list">
                        <?php foreach ($banners as $b): ?>
                        <div class="item-row">
                            <form method="POST">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="update_banner">
                                <input type="hidden" name="id" value="<?= (int)$b['id'] ?>">
                                <div class="form-grid-2">
                                    <div class="field"><label>Title</label><input type="text" name="title" value="<?= e($b['title']) ?>" required></div>
                                    <div class="field"><label>Image URL</label><input type="text" name="image_url" value="<?= e($b['image_url']) ?>" required></div>
                                    <div class="field"><label>Link</label><input type="text" name="destination_link" value="<?= e($b['destination_link']) ?>"></div>
                                    <div class="field"><label>Button Text</label><input type="text" name="button_text" value="<?= e($b['button_text']) ?>"></div>
                                    <div class="field"><label>Order</label><input type="number" name="display_order" value="<?= (int)$b['display_order'] ?>"></div>
                                    <div class="field"><label>Subtitle</label><input type="text" name="subtitle" value="<?= e($b['subtitle']) ?>"></div>
                                </div>
                                <div class="item-row-head">
                                    <label class="checkbox-row" style="margin:0;"><input type="checkbox" name="is_active" <?= (int)$b['is_active'] === 1 ? 'checked' : '' ?>> Active</label>
                                    <div style="display:flex;gap:8px;">
                                        <button type="submit" class="btn btn-primary btn-sm">Save Banner</button>
                                    </div>
                                </div>
                            </form>
                            <form method="POST" data-confirm="Delete this banner?" style="margin-top:6px;">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="delete_banner">
                                <input type="hidden" name="id" value="<?= (int)$b['id'] ?>">
                                <button type="submit" class="btn btn-danger btn-sm">Delete Banner</button>
                            </form>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

            <!-- E. JOURNEY MANAGEMENT -->
            <section class="tab-panel" data-tab-panel="journey">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="add_milestone">
                    <h2>E. Add Journey Milestone</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Year / Date Label</label><input type="text" name="year_label" placeholder="e.g. 2027" required></div>
                        <div class="field"><label>Display Order</label><input type="number" name="display_order" value="<?= count($milestones) + 1 ?>"></div>
                    </div>
                    <div class="field"><label>Milestone Title</label><input type="text" name="title" required></div>
                    <div class="field"><label>Description</label><textarea name="description" rows="2" required></textarea></div>
                    <label class="checkbox-row"><input type="checkbox" name="is_active" checked> Active</label>
                    <button type="submit" class="btn btn-primary">Add Milestone</button>
                </form>

                <div class="panel-card">
                    <h2>Edit Milestones</h2>
                    <div class="item-list">
                        <?php foreach ($milestones as $ms): ?>
                        <div class="item-row">
                            <form method="POST">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="update_milestone">
                                <input type="hidden" name="id" value="<?= (int)$ms['id'] ?>">
                                <div class="form-grid-2">
                                    <div class="field"><label>Year</label><input type="text" name="year_label" value="<?= e($ms['year_label']) ?>" required></div>
                                    <div class="field"><label>Order</label><input type="number" name="display_order" value="<?= (int)$ms['display_order'] ?>"></div>
                                </div>
                                <div class="field"><label>Title</label><input type="text" name="title" value="<?= e($ms['title']) ?>" required></div>
                                <div class="field"><label>Description</label><textarea name="description" rows="2" required><?= e($ms['description']) ?></textarea></div>
                                <div class="item-row-head">
                                    <label class="checkbox-row" style="margin:0;"><input type="checkbox" name="is_active" <?= (int)$ms['is_active'] === 1 ? 'checked' : '' ?>> Active</label>
                                    <button type="submit" class="btn btn-primary btn-sm">Update Milestone</button>
                                </div>
                            </form>
                            <form method="POST" data-confirm="Delete this milestone?">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="delete_milestone">
                                <input type="hidden" name="id" value="<?= (int)$ms['id'] ?>">
                                <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                            </form>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

            <!-- F. SERVICE MANAGEMENT -->
            <section class="tab-panel" data-tab-panel="services">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="add_service">
                    <h2>F. Add New Service</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Number (e.g. 07)</label><input type="text" name="service_number" value="0<?= count($services) + 1 ?>"></div>
                        <div class="field">
                            <label>Icon</label>
                            <select name="icon_key">
                                <option value="code">Code / Web</option>
                                <option value="globe">Globe</option>
                                <option value="shield-user">Shield User</option>
                                <option value="alert-shield">Safety Shield</option>
                                <option value="bot">Bot / Automation</option>
                                <option value="video">Video</option>
                                <option value="sparkles">Sparkles / Custom</option>
                                <option value="cpu">CPU / Tech</option>
                            </select>
                        </div>
                        <div class="field"><label>Service Title</label><input type="text" name="title" required></div>
                        <div class="field"><label>Contact CTA Text</label><input type="text" name="contact_button_text" value="Request This Service"></div>
                        <div class="field"><label>Platforms (comma separated: web,telegram,tiktok,facebook,instagram,youtube)</label><input type="text" name="platforms_csv" value="web"></div>
                        <div class="field"><label>Display Order</label><input type="number" name="display_order" value="<?= count($services) + 1 ?>"></div>
                    </div>
                    <div class="field"><label>Short Card Description</label><input type="text" name="short_description" required></div>
                    <div class="field"><label>Full Modal Description</label><textarea name="full_description" rows="3" required></textarea></div>
                    <div class="field"><label>Features (one per line)</label><textarea name="features_lines" rows="3"></textarea></div>
                    <label class="checkbox-row"><input type="checkbox" name="is_active" checked> Active</label>
                    <button type="submit" class="btn btn-primary">Add Service</button>
                </form>

                <div class="panel-card">
                    <h2>Manage Existing Services</h2>
                    <div class="item-list">
                        <?php foreach ($services as $srv):
                            $featLines = implode("\n", $srv['features']);
                            $platCsv = implode(',', $srv['platforms']);
                        ?>
                        <div class="item-row">
                            <form method="POST">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="update_service">
                                <input type="hidden" name="id" value="<?= (int)$srv['id'] ?>">
                                <div class="form-grid-2">
                                    <div class="field"><label>Number</label><input type="text" name="service_number" value="<?= e($srv['service_number']) ?>"></div>
                                    <div class="field">
                                        <label>Icon</label>
                                        <select name="icon_key">
                                            <?php foreach (['code','globe','shield-user','alert-shield','bot','video','sparkles','cpu'] as $ik): ?>
                                            <option value="<?= e($ik) ?>" <?= $srv['icon_key'] === $ik ? 'selected' : '' ?>><?= e($ik) ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="field"><label>Title</label><input type="text" name="title" value="<?= e($srv['title']) ?>" required></div>
                                    <div class="field"><label>Contact CTA Text</label><input type="text" name="contact_button_text" value="<?= e($srv['contact_button_text']) ?>"></div>
                                    <div class="field"><label>Platforms CSV</label><input type="text" name="platforms_csv" value="<?= e($platCsv) ?>"></div>
                                    <div class="field"><label>Order</label><input type="number" name="display_order" value="<?= (int)$srv['display_order'] ?>"></div>
                                </div>
                                <div class="field"><label>Short Description</label><input type="text" name="short_description" value="<?= e($srv['short_description']) ?>" required></div>
                                <div class="field"><label>Full Description</label><textarea name="full_description" rows="2" required><?= e($srv['full_description']) ?></textarea></div>
                                <div class="field"><label>Features (one per line)</label><textarea name="features_lines" rows="4"><?= e($featLines) ?></textarea></div>
                                <div class="item-row-head">
                                    <label class="checkbox-row" style="margin:0;"><input type="checkbox" name="is_active" <?= (int)$srv['is_active'] === 1 ? 'checked' : '' ?>> Active</label>
                                    <button type="submit" class="btn btn-primary btn-sm">Update Service</button>
                                </div>
                            </form>
                            <form method="POST" data-confirm="Delete this service?">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="delete_service">
                                <input type="hidden" name="id" value="<?= (int)$srv['id'] ?>">
                                <button type="submit" class="btn btn-danger btn-sm">Delete Service</button>
                            </form>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

            <!-- G. SOCIAL LINKS -->
            <section class="tab-panel" data-tab-panel="social">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_social_links">
                    <h2>G. Social Links Management</h2>
                    <p class="panel-desc">Leave URL blank to show an unconfigured/disabled state on the public page, or uncheck Active to hide it completely.</p>
                    <div class="item-list">
                        <?php foreach ($socials as $soc): ?>
                        <div class="item-row">
                            <input type="hidden" name="social_id[]" value="<?= (int)$soc['id'] ?>">
                            <div class="item-row-head">
                                <strong><?= e($soc['platform_name']) ?></strong>
                                <label class="checkbox-row" style="margin:0;"><input type="checkbox" name="is_active_<?= (int)$soc['id'] ?>" <?= (int)$soc['is_active'] === 1 ? 'checked' : '' ?>> Visible</label>
                            </div>
                            <div class="form-grid-2">
                                <div class="field"><label>Profile / Action URL</label><input type="text" name="url[]" value="<?= e($soc['url']) ?>" placeholder="https://... or mailto:..."></div>
                                <div class="field"><label>Supporting Text</label><input type="text" name="supporting_text[]" value="<?= e($soc['supporting_text']) ?>"></div>
                                <div class="field"><label>Brand Accent Hex</label><input type="text" name="brand_color[]" value="<?= e($soc['brand_color']) ?>"></div>
                                <div class="field"><label>Order</label><input type="number" name="display_order[]" value="<?= (int)$soc['display_order'] ?>"></div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top:14px;">Save Social Links</button>
                </form>
            </section>

            <!-- H. CONTACT SETTINGS -->
            <section class="tab-panel" data-tab-panel="contact">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_contact_settings">
                    <h2>H. Contact Settings</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Section Heading</label><input type="text" name="contact_heading" value="<?= e(setting($settings, 'contact_heading')) ?>"></div>
                        <div class="field"><label>Business / Contact Email</label><input type="email" name="contact_email" value="<?= e(setting($settings, 'contact_email')) ?>"></div>
                        <div class="field"><label>WhatsApp Number (with country code)</label><input type="text" name="contact_whatsapp" value="<?= e(setting($settings, 'contact_whatsapp')) ?>"></div>
                        <div class="field"><label>Telegram Link</label><input type="text" name="contact_telegram" value="<?= e(setting($settings, 'contact_telegram')) ?>"></div>
                    </div>
                    <div class="field"><label>Section Subtitle</label><input type="text" name="contact_subtitle" value="<?= e(setting($settings, 'contact_subtitle')) ?>"></div>
                    <div class="field"><label>Success Confirmation Message</label><textarea name="contact_success_message" rows="2"><?= e(setting($settings, 'contact_success_message')) ?></textarea></div>
                    <label class="checkbox-row"><input type="checkbox" name="contact_enable_whatsapp" <?= setting($settings, 'contact_enable_whatsapp', '1') === '1' ? 'checked' : '' ?>> Generate WhatsApp Redirect Action after Form Submit</label>
                    <label class="checkbox-row"><input type="checkbox" name="contact_enable_email_mailto" <?= setting($settings, 'contact_enable_email_mailto', '1') === '1' ? 'checked' : '' ?>> Provide Email (mailto) Fallback Action</label>
                    <label class="checkbox-row"><input type="checkbox" name="contact_enable_php_mail" <?= setting($settings, 'contact_enable_php_mail', '0') === '1' ? 'checked' : '' ?>> Enable Server-Side PHP mail() (if supported by host)</label>
                    <button type="submit" class="btn btn-primary">Save Contact Settings</button>
                </form>
            </section>

            <!-- I. AI ASSISTANT SETTINGS & KNOWLEDGE BASE -->
            <section class="tab-panel" data-tab-panel="ai">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_ai_settings">
                    <h2>I. AI Assistant Configuration</h2>
                    <p class="panel-desc">Supports Built-in Mode (zero external API required) and Optional External AI API Mode. API keys are encrypted server-side and never sent to public JS.</p>

                    <label class="checkbox-row"><input type="checkbox" name="is_enabled" <?= (int)$aiSettings['is_enabled'] === 1 ? 'checked' : '' ?>> Enable ASIF'S ASSISTANT on Public Website</label>

                    <div class="form-grid-2">
                        <div class="field">
                            <label>Assistant Mode</label>
                            <select name="mode">
                                <option value="builtin" <?= $aiSettings['mode'] === 'builtin' ? 'selected' : '' ?>>MODE 1 — Built-in Assistant (No API Key Needed)</option>
                                <option value="api" <?= $aiSettings['mode'] === 'api' ? 'selected' : '' ?>>MODE 2 — External AI API Enabled (with Mode 1 fallback)</option>
                            </select>
                        </div>
                        <div class="field"><label>Assistant Display Name</label><input type="text" name="assistant_name" value="<?= e($aiSettings['assistant_name']) ?>"></div>
                        <div class="field">
                            <label>API Provider Format (Mode 2)</label>
                            <select name="api_provider">
                                <option value="openai_compatible" <?= $aiSettings['api_provider'] === 'openai_compatible' ? 'selected' : '' ?>>OpenAI-Compatible (OpenAI, Groq, OpenRouter, DeepSeek)</option>
                                <option value="gemini" <?= $aiSettings['api_provider'] === 'gemini' ? 'selected' : '' ?>>Google Gemini REST API</option>
                                <option value="anthropic" <?= $aiSettings['api_provider'] === 'anthropic' ? 'selected' : '' ?>>Anthropic Messages API</option>
                            </select>
                        </div>
                        <div class="field"><label>Model Name</label><input type="text" name="model_name" value="<?= e($aiSettings['model_name']) ?>" placeholder="gpt-4o-mini or gemini-2.5-flash"></div>
                        <div class="field"><label>API Endpoint URL</label><input type="text" name="api_endpoint" value="<?= e($aiSettings['api_endpoint']) ?>"></div>
                        <div class="field"><label>Rate Limit (Requests / Min / IP)</label><input type="number" name="rate_limit_per_minute" value="<?= (int)$aiSettings['rate_limit_per_minute'] ?>" min="3" max="120"></div>
                    </div>

                    <div class="field">
                        <label>Update API Key (<?= $hasApiKey ? 'Encrypted key currently saved on server — leave blank to keep existing' : 'No API key saved' ?>)</label>
                        <input type="password" name="api_key_new" placeholder="Enter new secret API key only if replacing" autocomplete="new-password">
                    </div>
                    <?php if ($hasApiKey): ?>
                    <label class="checkbox-row"><input type="checkbox" name="clear_api_key"> Clear Stored API Key</label>
                    <?php endif; ?>

                    <div class="field"><label>Welcome Message</label><textarea name="welcome_message" rows="2"><?= e($aiSettings['welcome_message']) ?></textarea></div>
                    <div class="field"><label>Suggested Questions (one per line)</label><textarea name="suggested_questions" rows="4"><?= e($suggestedText) ?></textarea></div>
                    <div class="field"><label>System Instructions (Server-Side Scope Guard)</label><textarea name="system_instructions" rows="5"><?= e($aiSettings['system_instructions']) ?></textarea></div>
                    <div class="form-grid-2">
                        <div class="field"><label>Fallback Message (Missing Info)</label><textarea name="fallback_message" rows="2"><?= e($aiSettings['fallback_message']) ?></textarea></div>
                        <div class="field"><label>Off-Topic Refusal Message</label><textarea name="off_topic_message" rows="2"><?= e($aiSettings['off_topic_message']) ?></textarea></div>
                    </div>
                    <button type="submit" class="btn btn-primary">Save AI Configuration</button>
                </form>

                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="add_kb">
                    <h2>Add Approved Knowledge Base Entry</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Topic</label><input type="text" name="topic" required></div>
                        <div class="field"><label>Category</label><input type="text" name="category" value="general"></div>
                        <div class="field"><label>Keywords (comma separated)</label><input type="text" name="keywords" required></div>
                        <div class="field"><label>Display Order</label><input type="number" name="display_order" value="<?= count($kbItems) + 1 ?>"></div>
                    </div>
                    <div class="field"><label>Approved Answer Text</label><textarea name="answer_text" rows="3" required></textarea></div>
                    <label class="checkbox-row"><input type="checkbox" name="is_active" checked> Active</label>
                    <button type="submit" class="btn btn-primary">Add Knowledge Entry</button>
                </form>

                <div class="panel-card">
                    <h2>Manage Approved Knowledge Base</h2>
                    <div class="item-list">
                        <?php foreach ($kbItems as $kb): ?>
                        <div class="item-row">
                            <form method="POST">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="update_kb">
                                <input type="hidden" name="id" value="<?= (int)$kb['id'] ?>">
                                <div class="form-grid-2">
                                    <div class="field"><label>Topic</label><input type="text" name="topic" value="<?= e($kb['topic']) ?>" required></div>
                                    <div class="field"><label>Category</label><input type="text" name="category" value="<?= e($kb['category']) ?>"></div>
                                    <div class="field"><label>Keywords</label><input type="text" name="keywords" value="<?= e($kb['keywords']) ?>" required></div>
                                    <div class="field"><label>Order</label><input type="number" name="display_order" value="<?= (int)$kb['display_order'] ?>"></div>
                                </div>
                                <div class="field"><label>Answer Text</label><textarea name="answer_text" rows="2" required><?= e($kb['answer_text']) ?></textarea></div>
                                <div class="item-row-head">
                                    <label class="checkbox-row" style="margin:0;"><input type="checkbox" name="is_active" <?= (int)$kb['is_active'] === 1 ? 'checked' : '' ?>> Active</label>
                                    <button type="submit" class="btn btn-primary btn-sm">Save Entry</button>
                                </div>
                            </form>
                            <form method="POST" data-confirm="Delete this knowledge entry?">
                                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                                <input type="hidden" name="action" value="delete_kb">
                                <input type="hidden" name="id" value="<?= (int)$kb['id'] ?>">
                                <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                            </form>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

            <!-- J. WEBSITE APPEARANCE -->
            <section class="tab-panel" data-tab-panel="appearance">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_appearance">
                    <h2>J. Website Appearance &amp; Visibility</h2>
                    <div class="form-grid-2">
                        <div class="field"><label>Primary Accent Hex</label><input type="color" name="accent_primary" value="<?= e(setting($settings, 'accent_primary', '#00E5FF')) ?>" style="height:44px;padding:4px;"></div>
                        <div class="field"><label>Secondary Accent Hex</label><input type="color" name="accent_secondary" value="<?= e(setting($settings, 'accent_secondary', '#00FF9D')) ?>" style="height:44px;padding:4px;"></div>
                        <div class="field"><label>Purple Accent Hex</label><input type="color" name="accent_purple" value="<?= e(setting($settings, 'accent_purple', '#8B5CF6')) ?>" style="height:44px;padding:4px;"></div>
                        <div class="field"><label>Card Radius (px)</label><input type="number" name="card_radius" min="8" max="28" value="<?= e(setting($settings, 'card_radius', '18')) ?>"></div>
                        <div class="field">
                            <label>Background Style</label>
                            <select name="bg_style">
                                <option value="cyber-grid" <?= setting($settings, 'bg_style') === 'cyber-grid' ? 'selected' : '' ?>>Cyber Grid + Ambient Orbs</option>
                                <option value="minimal" <?= setting($settings, 'bg_style') === 'minimal' ? 'selected' : '' ?>>Minimal Ambient</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Animation Intensity</label>
                            <select name="animation_intensity">
                                <option value="subtle" <?= setting($settings, 'animation_intensity') === 'subtle' ? 'selected' : '' ?>>Subtle</option>
                                <option value="balanced" <?= setting($settings, 'animation_intensity', 'balanced') === 'balanced' ? 'selected' : '' ?>>Balanced</option>
                                <option value="dynamic" <?= setting($settings, 'animation_intensity') === 'dynamic' ? 'selected' : '' ?>>Dynamic</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Glow Intensity</label>
                            <select name="glow_intensity">
                                <option value="low" <?= setting($settings, 'glow_intensity') === 'low' ? 'selected' : '' ?>>Low</option>
                                <option value="medium" <?= setting($settings, 'glow_intensity', 'medium') === 'medium' ? 'selected' : '' ?>>Medium</option>
                                <option value="high" <?= setting($settings, 'glow_intensity') === 'high' ? 'selected' : '' ?>>High</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Border Style</label>
                            <select name="border_style">
                                <option value="conic-glow" <?= setting($settings, 'border_style', 'conic-glow') === 'conic-glow' ? 'selected' : '' ?>>Animated Conic Glow</option>
                                <option value="static-subtle" <?= setting($settings, 'border_style') === 'static-subtle' ? 'selected' : '' ?>>Static Subtle Hairline</option>
                            </select>
                        </div>
                    </div>
                    <h3 style="margin:14px 0 10px;font-size:.95rem;">Section Visibility</h3>
                    <label class="checkbox-row"><input type="checkbox" name="show_banners" <?= setting($settings, 'show_banners', '1') === '1' ? 'checked' : '' ?>> Show Banner Slider</label>
                    <label class="checkbox-row"><input type="checkbox" name="show_journey" <?= setting($settings, 'show_journey', '1') === '1' ? 'checked' : '' ?>> Show Journey Section</label>
                    <label class="checkbox-row"><input type="checkbox" name="show_about" <?= setting($settings, 'show_about', '1') === '1' ? 'checked' : '' ?>> Show About Section</label>
                    <label class="checkbox-row"><input type="checkbox" name="show_services" <?= setting($settings, 'show_services', '1') === '1' ? 'checked' : '' ?>> Show Services Section</label>
                    <label class="checkbox-row"><input type="checkbox" name="show_support" <?= setting($settings, 'show_support', '1') === '1' ? 'checked' : '' ?>> Show Support Section</label>
                    <button type="submit" class="btn btn-primary">Save Appearance</button>
                </form>
            </section>

            <!-- K. SEO SETTINGS -->
            <section class="tab-panel" data-tab-panel="seo">
                <form method="POST" class="panel-card">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="action" value="save_seo">
                    <h2>K. SEO &amp; Social Share Settings</h2>
                    <div class="field"><label>Meta Title</label><input type="text" name="seo_meta_title" value="<?= e(setting($settings, 'seo_meta_title')) ?>"></div>
                    <div class="field"><label>Meta Description</label><textarea name="seo_meta_description" rows="3"><?= e(setting($settings, 'seo_meta_description')) ?></textarea></div>
                    <div class="form-grid-2">
                        <div class="field"><label>Open Graph Image URL</label><input type="text" name="seo_og_image" value="<?= e(setting($settings, 'seo_og_image')) ?>"></div>
                        <div class="field"><label>Favicon URL</label><input type="text" name="favicon_url" value="<?= e(setting($settings, 'favicon_url')) ?>"></div>
                    </div>
                    <div class="field">
                        <label>Search Engine Indexing</label>
                        <select name="seo_robots">
                            <option value="index, follow" <?= setting($settings, 'seo_robots', 'index, follow') === 'index, follow' ? 'selected' : '' ?>>index, follow (Public)</option>
                            <option value="noindex, nofollow" <?= setting($settings, 'seo_robots') === 'noindex, nofollow' ? 'selected' : '' ?>>noindex, nofollow (Private)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Save SEO Settings</button>
                </form>
            </section>

            <!-- L. BACKUP AND RESTORE -->
            <section class="tab-panel" data-tab-panel="backup">
                <div class="panel-card">
                    <h2>L. Export Database Backup</h2>
                    <p class="panel-desc">Download a validated JSON snapshot of all site settings, banners, milestones, services, social links, and AI knowledge base. A copy is also protected in <code>/backups/</code> (blocked from public web access via <code>.htaccess</code>).</p>
                    <form method="POST">
                        <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                        <input type="hidden" name="action" value="export_backup">
                        <button type="submit" class="btn btn-primary">Download JSON Backup Now</button>
                    </form>
                </div>

                <div class="panel-card">
                    <h2>Restore From Validated Backup</h2>
                    <p class="panel-desc">Restoring replaces public site configuration, banners, milestones, services, social links, and AI knowledge base inside a safe database transaction. Admin credentials and encrypted API keys remain untouched.</p>
                    <div id="restoreClientError" class="alert alert-error hidden"></div>
                    <form id="restoreBackupForm" method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                        <input type="hidden" name="action" value="import_backup">
                        <div class="field"><label>Select Backup JSON File</label><input type="file" name="backup_file" accept=".json,application/json" required></div>
                        <div class="field"><label>Type <code>RESTORE</code> to confirm destructive replacement</label><input type="text" id="restore_confirm_text" name="restore_confirm" placeholder="Type RESTORE" required></div>
                        <button type="submit" class="btn btn-danger">Validate &amp; Restore Backup</button>
                    </form>
                </div>
            </section>
        </div>
    </div>
</div>
<script src="admin.js?v=1.0.0"></script>
</body>
</html>
