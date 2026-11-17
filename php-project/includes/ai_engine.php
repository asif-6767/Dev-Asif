<?php
declare(strict_types=1);

/**
 * ASIF'S ASSISTANT — Dual-Mode AI Engine
 * Mode 1: Built-in Structured Knowledge Base + Intent & Scope Matcher (Zero external API required)
 * Mode 2: Server-Side Multi-Provider cURL API Integration (OpenAI-compatible / Gemini / Anthropic) with Mode 1 fallback
 */

if (!defined('ASIF_APP')) {
    http_response_code(403);
    exit('Direct access forbidden.');
}

function checkAiRateLimit(PDO $pdo, string $ipHash, int $maxPerMinute): bool
{
    $limit = max(3, min(120, $maxPerMinute));
    $now = time();

    $stmt = $pdo->prepare('SELECT window_start, request_count FROM ai_rate_limits WHERE ip_hash = ? LIMIT 1');
    $stmt->execute([$ipHash]);
    $row = $stmt->fetch();

    if (!$row) {
        $ins = $pdo->prepare('INSERT INTO ai_rate_limits (ip_hash, window_start, request_count) VALUES (?, ?, 1)');
        $ins->execute([$ipHash, $now]);
        return true;
    }

    $windowStart = (int)$row['window_start'];
    $count = (int)$row['request_count'];

    if (($now - $windowStart) >= 60) {
        $upd = $pdo->prepare('UPDATE ai_rate_limits SET window_start = ?, request_count = 1 WHERE ip_hash = ?');
        $upd->execute([$now, $ipHash]);
        return true;
    }

    if ($count >= $limit) {
        return false;
    }

    $upd = $pdo->prepare('UPDATE ai_rate_limits SET request_count = request_count + 1 WHERE ip_hash = ?');
    $upd->execute([$ipHash]);
    return true;
}

function isQueryRelevantToAsif(string $query): bool
{
    $q = strtolower(trim($query));
    if ($q === '') {
        return false;
    }

    // Immediate greeting support
    if (preg_match('/^(hi|hello|hey|salam|assalamu|good morning|good evening|greetings)\b/i', $q)) {
        return true;
    }

    // Explicit unrelated general-purpose keywords without Asif/service context
    $asifSignals = [
        'asif', 'islam', 'you', 'your', 'he', 'his', 'him', 'assistant', 'service', 'services',
        'website', 'web', 'site', 'portfolio', 'landing', 'ui', 'ux', 'bot', 'telegram',
        'video', 'short', 'reel', 'tiktok', 'youtube', 'facebook', 'instagram', 'social',
        'account', 'appeal', 'recover', 'recovery', 'suspend', 'report', 'impersonat',
        'harass', 'safety', 'cyber', 'journey', 'timeline', '2024', '2025', '2026', '2027',
        'about', 'who', 'where', 'location', 'kushtia', 'daulatpur', 'bangladesh', 'ssc',
        'education', 'study', 'computer science', 'goal', 'future', 'contact', 'support',
        'whatsapp', 'email', 'reach', 'connect', 'help', 'custom', 'project', 'solution',
        'price', 'cost', 'charge', 'fee', 'hire', 'work', 'digital', 'creator', 'experience'
    ];

    foreach ($asifSignals as $signal) {
        if (str_contains($q, $signal)) {
            return true;
        }
    }

    return false;
}

function buildLiveKnowledgeContext(PDO $pdo): array
{
    $settings = getAllSiteSettings($pdo);
    $milestones = getJourneyMilestones($pdo, true);
    $services = getServicesWithFeatures($pdo, true);
    $socials = getSocialLinks($pdo, true);

    $stmt = $pdo->query('SELECT topic, keywords, answer_text, category FROM ai_knowledge WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
    $kbEntries = $stmt->fetchAll();

    return [
        'settings'   => $settings,
        'milestones' => $milestones,
        'services'   => $services,
        'socials'    => $socials,
        'kb'         => $kbEntries,
    ];
}

function answerWithBuiltinAssistant(PDO $pdo, string $userMessage, array $aiSettings): string
{
    $q = strtolower(trim($userMessage));
    $fallback = (string)($aiSettings['fallback_message'] ?? "I don't have confirmed information about that yet. Please contact Asif directly for clarification.");
    $offTopic = (string)($aiSettings['off_topic_message'] ?? "I'm Asif's website assistant. I can help you with information about Asif Islam, his journey, digital services, and support options.");

    if (preg_match('/^(hi|hello|hey|assalamu|salam|good\s+(morning|afternoon|evening))\b[!. ]*$/i', $q)) {
        return (string)($aiSettings['welcome_message'] ?? "Hello! I'm Asif's Assistant. How can I help you explore his digital services and learn more about his journey?");
    }

    if (!isQueryRelevantToAsif($q)) {
        return $offTopic;
    }

    $ctx = buildLiveKnowledgeContext($pdo);
    $settings = $ctx['settings'];

    // Direct structured checks from live DB settings/services
    if (preg_match('/\b(price|pricing|cost|charge|fee|rate|budget|how much)\b/i', $q)) {
        return "Project pricing is not fixed on the website because each request has unique requirements. Please contact Asif directly via WhatsApp, Email, or the Support Contact Form with your project details.";
    }

    if (preg_match('/\b(guarant|100%|promise|hack|crack|mass report)\b/i', $q)) {
        return "Asif only provides lawful, authorized guidance through official platform channels. Recovery, appeal approval, or content removal depends strictly on each platform's review team and is never guaranteed.";
    }

    // Score KB entries
    $tokens = preg_split('/[^a-z0-9]+/i', $q, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    $bestScore = 0.0;
    $bestAnswer = '';

    foreach ($ctx['kb'] as $entry) {
        $score = 0.0;
        $keywords = array_filter(array_map('trim', explode(',', strtolower((string)$entry['keywords']))));
        $topic = strtolower((string)$entry['topic']);

        foreach ($keywords as $kw) {
            if ($kw !== '' && str_contains($q, $kw)) {
                $score += (str_contains($kw, ' ') ? 5.0 : 3.0);
            }
        }
        foreach ($tokens as $tok) {
            if (strlen($tok) < 3) {
                continue;
            }
            if (str_contains($topic, $tok)) {
                $score += 1.5;
            }
            foreach ($keywords as $kw) {
                if (str_contains($kw, $tok)) {
                    $score += 1.0;
                }
            }
        }

        if ($score > $bestScore) {
            $bestScore = $score;
            $bestAnswer = (string)$entry['answer_text'];
        }
    }

    // Also score individual active Services so dynamic edits in Admin reflect immediately
    foreach ($ctx['services'] as $srv) {
        $score = 0.0;
        $title = strtolower((string)$srv['title']);
        $short = strtolower((string)$srv['short_description']);
        foreach ($tokens as $tok) {
            if (strlen($tok) < 3) {
                continue;
            }
            if (str_contains($title, $tok)) {
                $score += 3.5;
            }
            if (str_contains($short, $tok)) {
                $score += 1.2;
            }
        }
        if ($score > $bestScore) {
            $bestScore = $score;
            $feats = !empty($srv['features']) ? ' Includes: ' . implode(', ', array_slice($srv['features'], 0, 4)) . '.' : '';
            $bestAnswer = $srv['title'] . ' — ' . $srv['full_description'] . $feats;
        }
    }

    // Dynamic profile/contact queries
    if (preg_match('/\b(where|location|live|from|kushtia|daulatpur|education|ssc|school|batch)\b/i', $q) && $bestScore < 4.5) {
        $name = setting($settings, 'profile_name', 'Asif Islam');
        $loc = setting($settings, 'profile_location', 'Daulatpur, Kushtia, Bangladesh');
        $edu = setting($settings, 'profile_education', 'SSC 2027 Batch');
        $goal = setting($settings, 'profile_future_goal', 'Computer Science & Technology');
        return "{$name} is based in {$loc}. He is an {$edu} student who began exploring digital technology in " . setting($settings, 'profile_started_year', '2024') . ", with a long-term goal to pursue {$goal}.";
    }

    if ($bestScore >= 2.5 && $bestAnswer !== '') {
        return $bestAnswer;
    }

    return $fallback;
}

function buildSystemPromptForApi(PDO $pdo, array $aiSettings): string
{
    $ctx = buildLiveKnowledgeContext($pdo);
    $s = $ctx['settings'];

    $lines = [];
    $lines[] = trim((string)($aiSettings['system_instructions'] ?? ''));
    $lines[] = "\n--- APPROVED WEBSITE FACTS ---";
    $lines[] = 'Name: ' . setting($s, 'profile_name', 'Asif Islam');
    $lines[] = 'Location: ' . setting($s, 'profile_location', 'Daulatpur, Kushtia, Bangladesh');
    $lines[] = 'Education: ' . setting($s, 'profile_education', 'SSC 2027 Batch');
    $lines[] = 'Journey Started: ' . setting($s, 'profile_started_year', '2024');
    $lines[] = 'Interests: ' . setting($s, 'profile_interests', 'Technology, Digital Creativity, Cybersecurity, Web Development');
    $lines[] = 'Future Goal: ' . setting($s, 'profile_future_goal', 'Computer Science & Technology');

    $lines[] = "\nJourney Milestones:";
    foreach ($ctx['milestones'] as $m) {
        $lines[] = "- {$m['year_label']} ({$m['title']}): {$m['description']}";
    }

    $lines[] = "\nServices:";
    foreach ($ctx['services'] as $srv) {
        $feats = !empty($srv['features']) ? ' [' . implode('; ', $srv['features']) . ']' : '';
        $lines[] = "- {$srv['service_number']} {$srv['title']}: {$srv['full_description']}{$feats}";
    }

    $lines[] = "\nActive Support Channels:";
    foreach ($ctx['socials'] as $soc) {
        if (trim((string)$soc['url']) !== '') {
            $lines[] = "- {$soc['platform_name']}: {$soc['url']} ({$soc['supporting_text']})";
        }
    }

    $lines[] = "\nAdditional Knowledge:";
    foreach ($ctx['kb'] as $kb) {
        $lines[] = "- {$kb['topic']}: {$kb['answer_text']}";
    }

    $lines[] = "\nIf asked unrelated topics, reply exactly: " . (string)$aiSettings['off_topic_message'];
    $lines[] = "If confirmed info is missing, reply exactly: " . (string)$aiSettings['fallback_message'];

    return implode("\n", $lines);
}

function callExternalAiApi(PDO $pdo, string $userMessage, array $aiSettings): ?string
{
    if (!function_exists('curl_init')) {
        return null;
    }

    $apiKey = decryptSecret((string)($aiSettings['api_key_encrypted'] ?? ''));
    $endpoint = trim((string)($aiSettings['api_endpoint'] ?? ''));
    $model = trim((string)($aiSettings['model_name'] ?? ''));
    $provider = strtolower(trim((string)($aiSettings['api_provider'] ?? 'openai_compatible')));

    if ($apiKey === '' || $endpoint === '' || $model === '') {
        return null;
    }

    $systemPrompt = buildSystemPromptForApi($pdo, $aiSettings);
    $headers = ['Content-Type: application/json'];
    $url = $endpoint;
    $payload = [];

    if ($provider === 'gemini') {
        if (!str_contains($url, 'key=')) {
            $sep = str_contains($url, '?') ? '&' : '?';
            $url .= $sep . 'key=' . urlencode($apiKey);
        }
        $payload = [
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => [['text' => $userMessage]],
                ],
            ],
            'generationConfig' => [
                'temperature'     => 0.35,
                'maxOutputTokens' => 380,
            ],
        ];
    } elseif ($provider === 'anthropic') {
        $headers[] = 'x-api-key: ' . $apiKey;
        $headers[] = 'anthropic-version: 2023-06-01';
        $payload = [
            'model'      => $model,
            'max_tokens' => 380,
            'system'     => $systemPrompt,
            'messages'   => [
                ['role' => 'user', 'content' => $userMessage],
            ],
        ];
    } else {
        // OpenAI-compatible (OpenAI, Groq, OpenRouter, DeepSeek, etc.)
        $headers[] = 'Authorization: Bearer ' . $apiKey;
        $payload = [
            'model'       => $model,
            'temperature' => 0.35,
            'max_tokens'  => 380,
            'messages'    => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMessage],
            ],
        ];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $responseBody = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false || $curlErr !== '' || $httpCode < 200 || $httpCode >= 300) {
        error_log("ASIF AI API fallback triggered (HTTP {$httpCode}): {$curlErr}");
        return null;
    }

    $decoded = json_decode($responseBody, true);
    if (!is_array($decoded)) {
        return null;
    }

    $reply = '';
    if ($provider === 'gemini') {
        $reply = (string)($decoded['candidates'][0]['content']['parts'][0]['text'] ?? '');
    } elseif ($provider === 'anthropic') {
        $reply = (string)($decoded['content'][0]['text'] ?? '');
    } else {
        $reply = (string)($decoded['choices'][0]['message']['content'] ?? '');
    }

    $reply = trim($reply);
    return $reply !== '' ? $reply : null;
}

function handleAssistantMessage(PDO $pdo, string $userMessage): array
{
    $aiSettings = getAiSettings($pdo);
    if ((int)($aiSettings['is_enabled'] ?? 1) !== 1) {
        return [
            'ok'    => false,
            'error' => 'The assistant is currently disabled.',
        ];
    }

    $mode = (string)($aiSettings['mode'] ?? 'builtin');
    $usedMode = 'builtin';
    $reply = null;

    if ($mode === 'api') {
        // Pre-filter obvious off-topic before spending API tokens
        if (!isQueryRelevantToAsif($userMessage)) {
            $reply = (string)($aiSettings['off_topic_message'] ?? "I'm Asif's website assistant. I can help you with information about Asif Islam, his journey, digital services, and support options.");
        } else {
            $apiReply = callExternalAiApi($pdo, $userMessage, $aiSettings);
            if ($apiReply !== null) {
                $reply = $apiReply;
                $usedMode = 'api';
            }
        }
    }

    if ($reply === null) {
        $reply = answerWithBuiltinAssistant($pdo, $userMessage, $aiSettings);
    }

    return [
        'ok'    => true,
        'reply' => $reply,
        'mode'  => $usedMode,
    ];
}
