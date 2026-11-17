<?php
declare(strict_types=1);

/**
 * ASIF ISLAM — Database & Application Secret Configuration
 *
 * InfinityFree Setup:
 * 1. Open InfinityFree Control Panel -> MySQL Databases.
 * 2. Create a database and copy your MySQL Hostname (e.g. sql123.infinityfree.com),
 *    Database Name (e.g. if0_12345678_asif), Username (e.g. if0_12345678), and Password.
 * 3. Replace the placeholder values below before uploading, or edit directly in File Manager.
 * 4. Generate a unique random string for APP_SECRET_KEY (never share it publicly).
 */

if (!defined('ASIF_APP')) {
    http_response_code(403);
    exit('Direct access forbidden.');
}

define('DB_HOST', 'sqlXXX.infinityfree.com');
define('DB_NAME', 'if0_XXXXXXXX_asif_db');
define('DB_USER', 'if0_XXXXXXXX');
define('DB_PASS', 'YOUR_MYSQL_PASSWORD');
define('DB_CHARSET', 'utf8mb4');

/**
 * Change this to a long random string (32+ characters) for encrypting stored AI API keys.
 */
define('APP_SECRET_KEY', 'CHANGE_THIS_TO_A_UNIQUE_64_CHAR_RANDOM_SECRET_KEY_BEFORE_DEPLOY');

/**
 * Returns a shared PDO instance with strict prepared statements.
 */
function getDbConnection(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        DB_HOST,
        DB_NAME,
        DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection error: ' . $e->getMessage());
        throw new RuntimeException('Database connection failed. Verify /config/database.php credentials and confirm schema.sql has been imported.');
    }
}
