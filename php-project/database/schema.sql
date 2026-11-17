-- =============================================================================
-- ASIF ISLAM — InfinityFree MySQL Database Schema & Initial Seed Data
-- Compatible with MySQL 5.7+ / MariaDB 10.3+ (utf8mb4)
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 1. Admin Users (populated securely via /admin/setup.php on first visit)
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(60) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL DEFAULT 'Asif Islam',
  `last_login_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Website Settings (General, Profile, Hero, Contact, Appearance, SEO)
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` MEDIUMTEXT NOT NULL,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`),
  KEY `idx_setting_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Animated Banners (managed via image URLs in Admin)
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(160) NOT NULL,
  `subtitle` VARCHAR(320) NOT NULL DEFAULT '',
  `image_url` VARCHAR(500) NOT NULL,
  `destination_link` VARCHAR(500) NOT NULL DEFAULT '',
  `button_text` VARCHAR(80) NOT NULL DEFAULT 'Explore',
  `display_order` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banner_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Journey Milestones
CREATE TABLE IF NOT EXISTS `journey_milestones` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `year_label` VARCHAR(40) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `display_order` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_journey_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Digital Services
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_number` VARCHAR(10) NOT NULL DEFAULT '01',
  `slug` VARCHAR(80) NOT NULL,
  `icon_key` VARCHAR(40) NOT NULL DEFAULT 'globe',
  `title` VARCHAR(160) NOT NULL,
  `short_description` VARCHAR(320) NOT NULL,
  `full_description` TEXT NOT NULL,
  `platforms_json` VARCHAR(500) NOT NULL DEFAULT '[]',
  `contact_button_text` VARCHAR(80) NOT NULL DEFAULT 'Request This Service',
  `display_order` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_service_slug` (`slug`),
  KEY `idx_services_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Service Features
CREATE TABLE IF NOT EXISTS `service_features` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` INT UNSIGNED NOT NULL,
  `feature_text` VARCHAR(220) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_sf_service` (`service_id`, `display_order`),
  CONSTRAINT `fk_sf_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Social & Communication Links
CREATE TABLE IF NOT EXISTS `social_links` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `platform_key` VARCHAR(40) NOT NULL,
  `platform_name` VARCHAR(80) NOT NULL,
  `supporting_text` VARCHAR(160) NOT NULL DEFAULT '',
  `url` VARCHAR(500) NOT NULL DEFAULT '',
  `brand_color` VARCHAR(20) NOT NULL DEFAULT '#00E5FF',
  `display_order` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_platform_key` (`platform_key`),
  KEY `idx_social_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. AI Assistant Settings
CREATE TABLE IF NOT EXISTS `ai_settings` (
  `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `mode` ENUM('builtin', 'api') NOT NULL DEFAULT 'builtin',
  `assistant_name` VARCHAR(80) NOT NULL DEFAULT 'ASIF''S ASSISTANT',
  `welcome_message` TEXT NOT NULL,
  `system_instructions` MEDIUMTEXT NOT NULL,
  `fallback_message` TEXT NOT NULL,
  `off_topic_message` TEXT NOT NULL,
  `api_provider` VARCHAR(40) NOT NULL DEFAULT 'openai_compatible',
  `api_endpoint` VARCHAR(500) NOT NULL DEFAULT 'https://api.openai.com/v1/chat/completions',
  `model_name` VARCHAR(120) NOT NULL DEFAULT 'gpt-4o-mini',
  `api_key_encrypted` TEXT NOT NULL,
  `suggested_questions_json` TEXT NOT NULL,
  `rate_limit_per_minute` INT NOT NULL DEFAULT 15,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AI Structured Knowledge Base
CREATE TABLE IF NOT EXISTS `ai_knowledge` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `topic` VARCHAR(160) NOT NULL,
  `keywords` VARCHAR(500) NOT NULL,
  `answer_text` TEXT NOT NULL,
  `category` VARCHAR(60) NOT NULL DEFAULT 'general',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_knowledge_active` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Contact Form Submissions
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `preferred_method` VARCHAR(40) NOT NULL DEFAULT 'WhatsApp',
  `service_category` VARCHAR(120) NOT NULL DEFAULT 'Website Development',
  `message` TEXT NOT NULL,
  `ip_hash` VARCHAR(64) NOT NULL DEFAULT '',
  `status` ENUM('new', 'read', 'replied') NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Security: Login Attempts & AI Rate Limits
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip_hash` VARCHAR(64) NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `success` TINYINT(1) NOT NULL DEFAULT 0,
  `attempted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_ip_time` (`ip_hash`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_rate_limits` (
  `ip_hash` VARCHAR(64) NOT NULL,
  `window_start` INT UNSIGNED NOT NULL,
  `request_count` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`ip_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA FOR ASIF ISLAM
-- =============================================================================

INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`) VALUES
-- General
('site_title', 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.', 'general'),
('brand_name', 'ASIF ISLAM', 'general'),
('logo_text', 'ASIF ISLAM', 'general'),
('site_description', 'Asif Islam — Independent digital creator and aspiring computer science student from Bangladesh exploring technology and building digital solutions.', 'general'),
('browser_title', 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.', 'general'),
('favicon_url', 'assets/images/asif-islam.jpg', 'general'),
('footer_text', 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.', 'general'),

-- Profile & About
('profile_name', 'Asif Islam', 'profile'),
('profile_image_url', 'assets/images/asif-islam.jpg', 'profile'),
('profile_location', 'Daulatpur, Kushtia, Bangladesh', 'profile'),
('profile_education', 'SSC 2027 Batch', 'profile'),
('profile_started_year', '2024', 'profile'),
('profile_interests', 'Technology, Digital Creativity, Cybersecurity, Web Development', 'profile'),
('profile_future_goal', 'Computer Science & Technology', 'profile'),
('about_heading', 'BEHIND THE DIGITAL WORLD', 'profile'),
('profile_introduction', 'Hi, I''m Asif Islam — a technology enthusiast, digital creator, and aspiring computer science student from Bangladesh.\n\nSince 2024, I''ve been exploring the digital world, learning new technologies, developing creative solutions, and building my experience across different areas of the online ecosystem.\n\nI enjoy staying active online, experimenting with technology, creating digital projects, and helping people solve their digital challenges.\n\nMy long-term ambition is to pursue Computer Science and continue growing in the fields of technology, cybersecurity, and software development.\n\nThis is my digital space — a place where creativity meets technology.', 'profile'),
('about_description', 'I''m Asif Islam, a technology enthusiast with a strong interest in digital creativity, online platforms, and cybersecurity-related technology.\n\nI enjoy learning, experimenting, building, and exploring how digital systems work.\n\nI believe technology is not just about using tools — it''s about understanding possibilities and creating useful solutions.\n\nCurrently, I''m continuing my educational journey as an SSC 2027 student, with a long-term ambition to study Computer Science and grow in the technology industry.', 'profile'),

-- Hero
('hero_badge', 'INDEPENDENT DIGITAL CREATOR', 'hero'),
('hero_heading', 'Building Digital Experiences. Exploring Tomorrow.', 'hero'),
('hero_subtitle', 'From creative websites to customized digital solutions, I explore technology and turn ideas into meaningful digital experiences.', 'hero'),
('hero_typing_phrases', 'Websites & Digital Presence|Custom Telegram Bots|Online Safety Guidance|Creative Short Videos', 'hero'),
('hero_primary_btn', 'Explore My Services', 'hero'),
('hero_secondary_btn', 'Discover My Journey', 'hero'),
('hero_bg_image_url', '', 'hero'),
('hero_profile_image_url', 'assets/images/asif-islam.jpg', 'hero'),
('hero_visible', '1', 'hero'),

-- Contact Settings
('contact_heading', 'LET''S CONNECT', 'contact'),
('contact_subtitle', 'Have a project, a question, or need digital assistance? Choose your preferred platform and get in touch.', 'contact'),
('contact_email', 'contact@asifislam.example', 'contact'),
('contact_whatsapp', '+8801XXXXXXXXX', 'contact'),
('contact_telegram', 'https://t.me/asifislam', 'contact'),
('contact_enable_whatsapp', '1', 'contact'),
('contact_enable_email_mailto', '1', 'contact'),
('contact_enable_php_mail', '0', 'contact'),
('contact_success_message', 'Your inquiry has been recorded cleanly. You can also continue directly via WhatsApp or Email below.', 'contact'),

-- Appearance Settings
('accent_primary', '#00E5FF', 'appearance'),
('accent_secondary', '#00FF9D', 'appearance'),
('accent_purple', '#8B5CF6', 'appearance'),
('bg_style', 'cyber-grid', 'appearance'),
('animation_intensity', 'balanced', 'appearance'),
('glow_intensity', 'medium', 'appearance'),
('border_style', 'conic-glow', 'appearance'),
('card_radius', '18', 'appearance'),
('show_banners', '1', 'appearance'),
('show_journey', '1', 'appearance'),
('show_about', '1', 'appearance'),
('show_services', '1', 'appearance'),
('show_support', '1', 'appearance'),

-- SEO Settings
('seo_meta_title', 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.', 'seo'),
('seo_meta_description', 'Independent digital creator and aspiring computer science student from Daulatpur, Kushtia, Bangladesh. Websites, Telegram bots, short videos, and online safety guidance.', 'seo'),
('seo_og_image', 'assets/images/asif-islam.jpg', 'seo'),
('seo_robots', 'index, follow', 'seo');

-- Default Banners (uses clean SVG/image placeholders or self-contained visual cards; URLs editable in Admin)
INSERT INTO `banners` (`id`, `title`, `subtitle`, `image_url`, `destination_link`, `button_text`, `display_order`, `is_active`) VALUES
(1, 'Custom Cyber-Tech Websites', 'Responsive personal portfolios, landing pages, and clean UI/UX crafted around your identity.', 'assets/images/banner-web.svg', '#services', 'Explore Services', 1, 1),
(2, 'Automated Telegram Bot Systems', 'Workflow automation, database-backed bots, and custom admin tools built cleanly.', 'assets/images/banner-bot.svg', '#services', 'View Bot Solutions', 2, 1),
(3, 'Lawful Online Safety & Account Guidance', 'Structured guidance for reporting impersonation, harmful content, and navigating official platform channels.', 'assets/images/banner-safety.svg', '#support', 'Get In Touch', 3, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Journey Milestones
INSERT INTO `journey_milestones` (`id`, `year_label`, `title`, `description`, `display_order`, `is_active`) VALUES
(1, '2024', 'The Beginning', 'Started exploring the digital world, online platforms, technology, and creative opportunities.', 1, 1),
(2, '2025', 'Learning & Exploration', 'Continued exploring digital tools, website technologies, online platforms, and creative projects.', 2, 1),
(3, '2026', 'Building & Expanding', 'Focused on developing digital projects, customized website solutions, Telegram bots, and learning more about cybersecurity-related topics.', 3, 1),
(4, '2027', 'The Next Chapter', 'An upcoming milestone focused on education, Computer Science ambitions, and continued growth in technology.', 4, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Services (01 - 06)
INSERT INTO `services` (`id`, `service_number`, `slug`, `icon_key`, `title`, `short_description`, `full_description`, `platforms_json`, `contact_button_text`, `display_order`, `is_active`) VALUES
(1, '01', 'website-development', 'code', 'Website Development', 'Modern, responsive, and customized websites designed to establish a strong digital presence.', 'Modern, responsive, and customized websites crafted with clean structure, fast performance, mobile-first layout, and cyber-tech visual polish tailored to personal brands and growing businesses.', '["web","uiux"]', 'Discuss a Website', 1, 1),
(2, '02', 'social-media-assistance', 'shield-user', 'Social Media Account Assistance', 'Guidance and assistance with common account-related issues across popular social platforms.', 'Structured, honest guidance for navigating official recovery, verification, and appeal workflows on major social media platforms. Note: Official platform decisions belong solely to each platform — recovery or appeal approval is never guaranteed.', '["tiktok","facebook","instagram","telegram","youtube"]', 'Request Guidance', 2, 1),
(3, '03', 'reporting-online-safety', 'alert-shield', 'Reporting & Online Safety Assistance', 'Guidance for reporting harmful content, impersonation, harassment, and policy violations through official platform channels.', 'Lawful and authorized guidance to document evidence and submit structured reports through official platform safety portals. No unauthorized access, hacking, mass reporting, or guaranteed removal is ever offered.', '["facebook","instagram","tiktok","youtube","telegram"]', 'Get Safety Guidance', 3, 1),
(4, '04', 'telegram-bot-development', 'bot', 'Telegram Bot Development', 'Customized Telegram bots designed to improve automation, communication, and digital workflows.', 'Purpose-built Telegram bots with automated reply flows, admin management dashboards, structured database integration, and customized command systems.', '["telegram"]', 'Plan a Telegram Bot', 4, 1),
(5, '05', 'short-video-creation', 'video', 'Short Video Creation', 'Creative short-form video editing and content presentation for modern social media platforms.', 'Dynamic short-form edits built for retention on YouTube Shorts, TikTok, and Instagram Reels, including clean pacing, captions, promotional edits, and basic motion graphics.', '["youtube","tiktok","instagram"]', 'Start a Video Project', 5, 1),
(6, '06', 'customized-digital-solutions', 'sparkles', 'Customized Digital Solutions', 'Have a different idea? Let''s discuss it and explore a customized digital solution.', 'Collaborative planning and custom-built web utilities, workflow tools, or tailored digital projects built cleanly around your exact requirements.', '["web","telegram"]', 'Share Your Idea', 6, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Service Features
INSERT INTO `service_features` (`id`, `service_id`, `feature_text`, `display_order`) VALUES
(1, 1, 'Personal Portfolio Websites', 1),
(2, 1, 'Business Websites', 2),
(3, 1, 'Landing Pages', 3),
(4, 1, 'Customized Website Design', 4),
(5, 1, 'Website UI/UX Improvements', 5),

(6, 2, 'Account Access & Recovery Guidance', 1),
(7, 2, 'Account Appeal Assistance', 2),
(8, 2, 'Suspended Account Guidance', 3),
(9, 2, 'Profile and Account Issues', 4),
(10, 2, 'Platform Support Guidance (No guaranteed recovery)', 5),

(11, 3, 'Fake Profile Reporting Guidance', 1),
(12, 3, 'Impersonation Reporting', 2),
(13, 3, 'Harassment Reporting Assistance', 3),
(14, 3, 'Harmful Content Reporting', 4),
(15, 3, 'Official Platform Complaint Guidance (Lawful channels only)', 5),

(16, 4, 'Custom Telegram Bots', 1),
(17, 4, 'Automated Reply Systems', 2),
(18, 4, 'Admin Management Systems', 3),
(19, 4, 'Database-Based Bot Solutions', 4),
(20, 4, 'Custom Bot Features', 5),

(21, 5, 'YouTube Shorts', 1),
(22, 5, 'TikTok Videos', 2),
(23, 5, 'Reels', 3),
(24, 5, 'Promotional Videos', 4),
(25, 5, 'Basic Motion Graphics', 5),

(26, 6, 'Custom Web Projects', 1),
(27, 6, 'Digital Tools', 2),
(28, 6, 'Creative Technical Solutions', 3),
(29, 6, 'Personalized Digital Projects', 4)
ON DUPLICATE KEY UPDATE `feature_text` = VALUES(`feature_text`);

-- Social Links
INSERT INTO `social_links` (`id`, `platform_key`, `platform_name`, `supporting_text`, `url`, `brand_color`, `display_order`, `is_active`) VALUES
(1, 'whatsapp', 'WhatsApp', 'Direct chat for projects & inquiries', 'https://wa.me/8801XXXXXXXXX', '#25D366', 1, 1),
(2, 'email', 'Email', 'Detailed briefs & official correspondence', 'mailto:contact@asifislam.example', '#00E5FF', 2, 1),
(3, 'telegram', 'Telegram', 'Fast messaging & bot consultations', 'https://t.me/asifislam', '#26A5E4', 3, 1),
(4, 'facebook', 'Facebook', 'Connect & follow digital updates', '', '#1877F2', 4, 1),
(5, 'instagram', 'Instagram', 'Creative reels & visual highlights', '', '#E4405F', 5, 1),
(6, 'tiktok', 'TikTok', 'Short-form edits & digital clips', '', '#00F2EA', 6, 1),
(7, 'youtube', 'YouTube', 'Longer videos & project showcases', '', '#FF0000', 7, 1)
ON DUPLICATE KEY UPDATE `platform_name` = VALUES(`platform_name`);

-- AI Settings (Mode 1 Built-in active by default)
INSERT INTO `ai_settings` (`id`, `is_enabled`, `mode`, `assistant_name`, `welcome_message`, `system_instructions`, `fallback_message`, `off_topic_message`, `api_provider`, `api_endpoint`, `model_name`, `api_key_encrypted`, `suggested_questions_json`, `rate_limit_per_minute`) VALUES
(1, 1, 'builtin', 'ASIF''S ASSISTANT',
'Hello! I''m Asif''s Assistant. How can I help you explore his digital services and learn more about his journey?',
'You are ASIF''S ASSISTANT, the official digital assistant for Asif Islam''s personal brand website.
STRICT RULES:
1. Only discuss Asif Islam, his provided personal information (Daulatpur, Kushtia, Bangladesh; SSC 2027 Batch; started exploring in 2024; Computer Science ambition), his digital journey, his 6 services (Website Development, Social Media Account Assistance, Reporting & Online Safety Assistance, Telegram Bot Development, Short Video Creation, Customized Digital Solutions), and how visitors can contact him.
2. NEVER behave like a general-purpose chatbot. If asked unrelated questions, reply with the configured off-topic message.
3. NEVER invent qualifications, certifications, pricing, client history, testimonials, or guaranteed recovery/removal outcomes.
4. For Social Media Assistance or Reporting Assistance, always clarify that guidance uses official lawful platform channels only and outcomes depend on the platform.
5. Keep replies concise, polite, professional, and grounded strictly in the approved knowledge base.',
'I don''t have confirmed information about that yet. Please contact Asif directly for clarification.',
'I''m Asif''s website assistant. I can help you with information about Asif Islam, his journey, digital services, and support options.',
'openai_compatible',
'https://api.openai.com/v1/chat/completions',
'gpt-4o-mini',
'',
'["Who is Asif Islam?","Tell me about his journey.","What services are available?","Do you develop websites?","Can you develop Telegram bots?","How can I contact Asif?"]',
15)
ON DUPLICATE KEY UPDATE `assistant_name` = VALUES(`assistant_name`);

-- AI Structured Knowledge Base
INSERT INTO `ai_knowledge` (`id`, `topic`, `keywords`, `answer_text`, `category`, `is_active`, `display_order`) VALUES
(1, 'Who is Asif Islam', 'who is asif, about asif, asif islam, background, location, education, ssc, bangladesh, kushtia, goal, computer science', 'Asif Islam is an independent digital creator, technology enthusiast, and SSC 2027 Batch student based in Daulatpur, Kushtia, Bangladesh. Since 2024, he has been exploring web technologies, digital creativity, Telegram automation, and cybersecurity-related topics, with a long-term ambition to study Computer Science.', 'profile', 1, 1),
(2, 'Digital Journey (2024–2027)', 'journey, timeline, started, 2024, 2025, 2026, 2027, history, chapter, milestone', 'Asif started exploring the digital world in 2024. In 2025 he deepened his exploration of web tools and creative projects; in 2026 he focused on customized websites, Telegram bots, and cybersecurity learning; and 2027 represents his upcoming educational milestone toward Computer Science.', 'journey', 1, 2),
(3, 'Available Services Overview', 'services, what do you do, help with, offer, capabilities, solutions', 'Asif offers six core digital services: 01 Website Development, 02 Social Media Account Assistance, 03 Reporting & Online Safety Assistance, 04 Telegram Bot Development, 05 Short Video Creation, and 06 Customized Digital Solutions. You can click any service card in the Services section to view full details.', 'services', 1, 3),
(4, 'Website Development', 'website, web, develop, portfolio, landing page, ui, ux, business site, html, php', 'Yes! Under Service 01 (Website Development), Asif builds modern, responsive personal portfolios, business websites, landing pages, customized web designs, and UI/UX improvements tailored to your digital presence.', 'services', 1, 4),
(5, 'Telegram Bot Development', 'telegram, bot, bots, automation, auto reply, admin bot, database bot', 'Yes! Under Service 04 (Telegram Bot Development), Asif designs customized Telegram bots including automated reply systems, admin management panels, database-connected workflows, and custom bot features.', 'services', 1, 5),
(6, 'Social Media & Online Safety Assistance', 'social media, account, recovery, appeal, suspended, tiktok, facebook, instagram, youtube, report, impersonation, harassment, fake profile', 'Asif provides lawful guidance for common social media account issues (TikTok, Facebook, Instagram, Telegram, YouTube) and step-by-step assistance for reporting impersonation, harassment, or policy violations through official platform channels. Outcomes depend strictly on each platform — recovery, appeal approval, or content removal is never guaranteed.', 'services', 1, 6),
(7, 'Short Video Creation & Custom Solutions', 'video, short video, reels, tiktok video, youtube shorts, motion graphics, custom project, digital tool', 'Under Service 05, Asif creates YouTube Shorts, TikTok videos, Reels, promotional edits, and basic motion graphics. Under Service 06, he collaborates on custom web projects and personalized digital tools.', 'services', 1, 7),
(8, 'How to Contact Asif', 'contact, support, whatsapp, email, telegram link, reach, connect, message, price, pricing, cost', 'You can connect with Asif through the Support section ("LET''S CONNECT") using the configured social platform cards (WhatsApp, Email, Telegram, and active social links) or by submitting the Contact Form with your preferred method and service category. For project scope or pricing details, please message Asif directly.', 'contact', 1, 8)
ON DUPLICATE KEY UPDATE `topic` = VALUES(`topic`);
