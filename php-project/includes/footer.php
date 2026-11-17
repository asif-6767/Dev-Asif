<?php
declare(strict_types=1);

if (!defined('ASIF_APP')) {
    http_response_code(403);
    exit('Direct access forbidden.');
}

$footerText = setting($settings, 'footer_text', 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.');
$aiEnabled  = !empty($aiPublic['enabled']);
$aiName     = (string)($aiPublic['assistant_name'] ?? "ASIF'S ASSISTANT");
$aiWelcome  = (string)($aiPublic['welcome_message'] ?? "Hello! I'm Asif's Assistant. How can I help you explore his digital services and learn more about his journey?");
$aiSuggested = $aiPublic['suggested_questions'] ?? [];
?>
    </main>

    <!-- Quiet Architectural Footer -->
    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="footer-brand-col">
                <span class="footer-wordmark"><?= e(setting($settings, 'brand_name', 'ASIF ISLAM')) ?></span>
                <p class="footer-tagline"><?= e($footerText) ?></p>
            </div>
            <div class="footer-links-col">
                <a href="#home">Home</a>
                <a href="#journey">Journey</a>
                <a href="#about">About</a>
                <a href="#services">Services</a>
                <a href="#support">Support</a>
                <a href="admin/" class="footer-admin-link">Admin</a>
            </div>
        </div>
        <div class="container footer-bottom">
            <span>&copy; <?= date('Y') ?> <?= e(setting($settings, 'profile_name', 'Asif Islam')) ?>. All rights reserved.</span>
            <span><?= e(setting($settings, 'profile_location', 'Daulatpur, Kushtia, Bangladesh')) ?></span>
        </div>
    </footer>

    <!-- Service Detail Modal -->
    <div id="serviceModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modalServiceTitle" aria-hidden="true">
        <div class="modal-card glow-frame">
            <button type="button" id="modalCloseBtn" class="modal-close-btn" aria-label="Close service details">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div class="modal-head">
                <div id="modalServiceIcon" class="service-icon-box large"></div>
                <div>
                    <span id="modalServiceNum" class="service-num-label">01</span>
                    <h3 id="modalServiceTitle" class="modal-title"></h3>
                </div>
            </div>
            <p id="modalServiceDesc" class="modal-desc"></p>
            <div class="modal-section-label">Key Capabilities</div>
            <ul id="modalServiceFeatures" class="modal-features-list"></ul>
            <div id="modalPlatformsWrap" class="modal-platforms-wrap hidden">
                <div class="modal-section-label">Supported Platforms</div>
                <div id="modalServicePlatforms" class="modal-platforms-row"></div>
            </div>
            <div class="modal-actions">
                <a href="#support" id="modalContactCta" class="btn-3d btn-primary-3d">
                    <span id="modalContactCtaText">Request This Service</span>
                    <span class="btn-arrow" aria-hidden="true">&rarr;</span>
                </a>
            </div>
        </div>
    </div>

    <?php if ($aiEnabled): ?>
    <!-- ASIF'S ASSISTANT Floating Launcher & Glassmorphic Chat Window -->
    <div id="aiAssistantRoot" class="ai-root">
        <button
            type="button"
            id="aiLauncherBtn"
            class="ai-launcher glow-frame"
            aria-label="Open <?= e($aiName) ?>"
            aria-expanded="false"
        >
            <span class="ai-launcher-pulse" aria-hidden="true"></span>
            <svg class="ai-launcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3z"/>
                <path d="M19 17v4M17 19h4"/>
            </svg>
        </button>

        <section
            id="aiChatWindow"
            class="ai-window glow-frame"
            aria-label="<?= e($aiName) ?>"
            aria-hidden="true"
        >
            <header class="ai-window-header">
                <div class="ai-header-id">
                    <span class="ai-avatar" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                            <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="3"/><path d="M9 13v2M15 13v2"/>
                        </svg>
                    </span>
                    <div>
                        <h3 class="ai-header-title"><?= e($aiName) ?></h3>
                        <p class="ai-header-sub">Official Brand &amp; Service Guide</p>
                    </div>
                </div>
                <div class="ai-header-controls">
                    <button type="button" id="aiMinimizeBtn" class="ai-ctrl-btn" aria-label="Minimize chat" title="Minimize">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
                    </button>
                    <button type="button" id="aiCloseBtn" class="ai-ctrl-btn" aria-label="Close chat" title="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            </header>

            <div id="aiMessages" class="ai-messages" role="log" aria-live="polite">
                <div class="ai-msg ai-msg-bot">
                    <div class="ai-msg-avatar" aria-hidden="true">AI</div>
                    <div class="ai-msg-body">
                        <div class="ai-bubble"><?= e($aiWelcome) ?></div>
                        <span class="ai-time">Just now</span>
                    </div>
                </div>
            </div>

            <?php if (!empty($aiSuggested)): ?>
            <div id="aiSuggestions" class="ai-suggestions">
                <?php foreach ($aiSuggested as $sq): ?>
                    <button type="button" class="ai-chip" data-ai-prompt="<?= e($sq) ?>"><?= e($sq) ?></button>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <form id="aiChatForm" class="ai-input-bar" autocomplete="off">
                <input
                    type="text"
                    id="aiInput"
                    class="ai-input"
                    placeholder="Ask about Asif, his journey, or services..."
                    maxlength="600"
                    required
                >
                <button type="submit" id="aiSendBtn" class="ai-send-btn" aria-label="Send message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </form>
        </section>
    </div>
    <?php endif; ?>

    <script src="assets/js/main.js?v=1.0.0" defer></script>
</body>
</html>
