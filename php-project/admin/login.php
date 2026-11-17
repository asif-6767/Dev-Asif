<?php
declare(strict_types=1);

define('ASIF_APP', true);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../includes/functions.php';

startSecureSession();
if (isAdminLoggedIn()) {
    header('Location: index.php');
    exit;
}

$csrfToken = getCsrfToken();
$error = '';

try {
    $pdo = getDbConnection();
    if (getAdminCount($pdo) === 0) {
        header('Location: setup.php');
        exit;
    }
} catch (Throwable $e) {
    $error = $e->getMessage();
}

if ($error === '' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = (string)($_POST['csrf_token'] ?? '');
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $ipHash = getClientIpHash();

    if (!verifyCsrfToken($token)) {
        $error = 'Security token expired. Please reload and try again.';
    } else {
        $rate = checkLoginRateLimit($pdo, $ipHash);
        if (!$rate['allowed']) {
            $error = 'Too many failed login attempts. Please wait 15 minutes before trying again.';
        } else {
            $stmt = $pdo->prepare('SELECT id, username, password_hash, display_name FROM admin_users WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, (string)$user['password_hash'])) {
                recordLoginAttempt($pdo, $ipHash, $username, true);
                session_regenerate_id(true);
                $_SESSION['admin_user_id']     = (int)$user['id'];
                $_SESSION['admin_username']    = (string)$user['username'];
                $_SESSION['admin_display_name']= (string)$user['display_name'];
                $_SESSION['admin_last_active'] = time();

                $pdo->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?')->execute([(int)$user['id']]);
                header('Location: index.php');
                exit;
            } else {
                recordLoginAttempt($pdo, $ipHash, $username, false);
                $error = 'Invalid username or password.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Login &mdash; ASIF ISLAM</title>
    <link rel="stylesheet" href="admin.css?v=1.0.0">
</head>
<body class="admin-auth-body">
    <div class="auth-card">
        <div class="auth-badge">ASIF ISLAM &middot; CONTROL PANEL</div>
        <h1>Administrator Sign In</h1>

        <?php if ($error !== ''): ?>
            <div class="alert alert-error"><?= e($error) ?></div>
        <?php endif; ?>

        <form method="POST" action="login.php" class="auth-form">
            <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
            <div class="field">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            <div class="field">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-full">Sign In</button>
        </form>

        <div class="auth-footer">
            <a href="../index.php">&larr; Back to Public Website</a>
        </div>
    </div>
</body>
</html>
