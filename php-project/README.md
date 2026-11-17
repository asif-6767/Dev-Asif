# ASIF ISLAM — Personal Brand & Digital Services Website (InfinityFree Edition)

Production-ready dark cyber-tech personal brand website built with **HTML5, CSS3, Vanilla JavaScript, PHP 8+, and MySQL (PDO)** — specifically structured for **InfinityFree shared hosting** with zero Node.js, React, Python, Docker, or Composer requirements at runtime.

---

## Project Structure

```text
/
├── index.php                     # Public DB-driven website
├── .htaccess                     # Blocks sensitive directories, disables listing, security headers
├── README.md
├── /config/
│   ├── .htaccess                 # Denies HTTP access
│   ├── database.php              # MySQL PDO connection & APP_SECRET_KEY
│   └── security.php              # Sessions, CSRF, AES-256 encryption, rate limits
├── /database/
│   ├── .htaccess                 # Denies HTTP access
│   └── schema.sql                # Normalized MySQL tables + authentic seed data
├── /backups/
│   └── .htaccess                 # Protects saved JSON backups from public access
├── /includes/
│   ├── functions.php             # Settings & catalog DB loaders
│   ├── ai_engine.php             # Dual-mode Asif's Assistant engine
│   ├── icons.php                 # Official SVG platform & service icons
│   ├── header.php                # Rounded glowing navbar & mobile-app drawer
│   └── footer.php                # Footer, Service modal & AI chat window
├── /api/
│   ├── chat.php                  # CSRF + rate-limited server AI endpoint
│   └── contact.php               # Contact validation, DB storage, WhatsApp & PHP mail
├── /assets/
│   ├── css/style.css
│   ├── css/animations.css        # 24-effect animation system + conic-gradient borders
│   ├── js/main.js
│   └── images/                   # Self-contained portrait & banner SVGs
└── /admin/
    ├── setup.php                 # Self-locking first-time admin setup
    ├── login.php                 # Rate-limited CSRF-protected login
    ├── logout.php
    ├── index.php                 # Full A–L admin control panel
    ├── admin.css
    └── admin.js
```

---

## InfinityFree Installation Guide

### Step 1: Create MySQL Database in InfinityFree
1. Log in to **InfinityFree Client Area** and open your hosting account's **Control Panel (VistaPanel)**.
2. Go to **MySQL Databases** and create a new database (e.g., `if0_12345678_asif`).
3. Note your:
   - **MySQL Hostname** (e.g., `sql203.infinityfree.com`)
   - **Database Name** (`if0_12345678_asif`)
   - **MySQL Username** (`if0_12345678`)
   - **MySQL Password** (your vPanel/hosting password)

### Step 2: Import Database Schema
1. In VistaPanel, open **phpMyAdmin** and click **Connect Now** on your new database.
2. Click the **Import** tab, select `/database/schema.sql`, and click **Go**.
3. Confirm all 12 tables are created and populated (`site_settings`, `services`, `service_features`, `journey_milestones`, `banners`, `social_links`, `ai_settings`, `ai_knowledge`, `admin_users`, `contact_messages`, `login_attempts`, `ai_rate_limits`).

### Step 3: Configure Database & Secret Key
1. Open `/config/database.php`.
2. Replace `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` with your InfinityFree values.
3. Replace `APP_SECRET_KEY` with a unique 64-character random string. (This encrypts any AI API key stored in MySQL.)

### Step 4: Upload Files to `/htdocs/`
1. Extract the ZIP locally or upload files directly to `/htdocs/` via **FileZilla (FTP)** or InfinityFree's Online File Manager.
2. Ensure `/.htaccess`, `/config/.htaccess`, `/database/.htaccess`, and `/backups/.htaccess` are uploaded (enable "Show hidden files" in your FTP client if needed).
3. Ensure `/backups/` has writable permissions (`755`) if you want server-side backup snapshots saved alongside browser downloads.

### Step 5: Complete First-Time Admin Setup
1. Visit `https://yourdomain.com/admin/setup.php`.
2. Create your admin username and strong password (minimum 10 characters).
3. Once submitted, `/admin/setup.php` **automatically locks itself** (`admin_users` count > 0).
4. For defense-in-depth, you may also delete `admin/setup.php` via FTP after setup.
5. Sign in at `https://yourdomain.com/admin/` to update your WhatsApp number, Email, Social links, Banners, and AI Assistant settings.

---

## AI Assistant Configuration (Mode 1 vs Mode 2)

- **Mode 1 — Built-in Assistant (Default)**: Works immediately out of the box with **zero external API keys**. Uses the structured `ai_knowledge` table, active `services`, `journey_milestones`, and `site_settings` with strict off-topic rejection.
- **Mode 2 — Optional AI API**: Open `/admin/` -> **I. AI Assistant & KB**, switch Mode to `MODE 2`, choose provider format (`OpenAI-Compatible`, `Google Gemini`, or `Anthropic`), enter endpoint, model, and your secret API key. Keys are AES-256-CBC encrypted in MySQL and called exclusively from `/api/chat.php` via server-side PHP `cURL`. If the API times out or fails, Mode 1 automatically serves a safe fallback answer.

---

## Security Checklist

- [ ] Updated `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, and `APP_SECRET_KEY` in `/config/database.php`.
- [ ] Verified `/config/`, `/database/`, and `/backups/` return `403 Forbidden` when accessed directly in a browser.
- [ ] Created admin credentials via `/admin/setup.php` and verified `/admin/setup.php` displays "Setup is locked".
- [ ] Enabled SSL/HTTPS on InfinityFree (recommended) so session cookies transmit with `Secure` flag.
- [ ] Never commit live `/config/database.php` credentials or API keys to public GitHub repositories.
- [ ] Test Contact Form submission and verify WhatsApp/Email links inside Admin -> H. Contact Settings.
