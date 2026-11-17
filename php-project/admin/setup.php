<?php
declare(strict_types=1);

define('ASIF_APP', true);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../includes/functions.php';

startSecureSession();
$csrfToken = getCsrfToken();
$error = '';
$success = '';
$locked = false;

try {
    $pdo = getDbConnection();
    $adminCount = getAdminCount($pdo);
    if ($adminCount > 0) {
        $locked = true;
    }
} catch (Throwable $e) {
    $error = $e->getMessage();
}

if (!$locked && $error === '' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = (string)($_POST['csrf_token'] ?? '');
    if (!verifyCsrfToken($token)) {
        $error = 'Invalid security token. Please refresh and try again.';
    } else {
        $username = trim((string)($_POST['username'] ?? ''));
        $displayName = trim((string)($_POST['display_name'] ?? 'Asif Islam'));
        $password = (string)($_POST['password'] ?? '');
        $confirm  = (string)($_POST['confirm_password'] ?? '');

        if (!preg_match('/^[a-zA-Z0-9_.-]{3,40}$/', $username)) {
            $error = 'Username must be 3–40 characters (letters, numbers, _, ., -).';
        } elseif (strlen($password) < 10) {
            $error = 'Password must be at least 10 characters long for strong security.';
        } elseif ($password !== $confirm) {
            $error = 'Password confirmation does not match.';
        } else {
            try {
                // Re-check count inside transaction to prevent race condition
                $pdo->beginTransaction();
                if (getAdminCount($pdo) > 0) {
                    $pdo->rollBack();
                    $locked = true;
                } else {
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare(
                        'INSERT INTO admin_users (username, password_hash, display_name, created_at, updated_at)
                         VALUES (?, ?, ?, NOW(), NOW())'
                    );
                    $stmt->execute([$username, $hash, $displayName !== '' ? $displayName : 'Asif Islam']);
                    $pdo->commit();
                    $success = 'Admin account created successfully. Initial setup is now permanently locked.';
                    $locked = true;
                }
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                $error = 'Could not create admin account: ' . $e->getMessage();
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
    <title>First-Time Setup &mdash; ASIF ISLAM Admin</title>
    <link rel="stylesheet" href="admin.css?v=1.0.0">
</head>
<body class="admin-auth-body">
    <div class="auth-card">
        <div class="auth-badge">INITIAL SETUP</div>
        <h1>Admin Account Configuration</h1>

        <?php if ($error !== ''): ?>
            <div class="alert alert-error"><?= e($error) ?></div>
        <?php endif; ?>

        <?php if ($success !== ''): ?>
            <div class="alert alert-success"><?= e($success) ?></div>
            <p class="auth-note">For extra security on shared hosting, you may also remove <code>/admin/setup.php</code> after signing in.</p>
            <a href="login.php" class="btn btn-primary btn-full">Proceed to Admin Login &rarr;</a>
        <?php elseif ($locked): ?>
            <div class="alert alert-error">Setup is locked because an admin account has already been configured.</div>
            <a href="login.php" class="btn btn-primary btn-full">Go to Admin Login &rarr;</a>
        <?php else: ?>
            <p class="auth-note">Create your private administrator credentials. This setup screen automatically disables itself once completed.</p>
            <form method="POST" action="setup.php" class="auth-form" autocomplete="off">
                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                <div class="field">
                    <label for="display_name">Display Name</label>
                    <input type="text" id="display_name" name="display_name" value="Asif Islam" required maxlength="100">
                </div>
                <div class="field">
                    <label for="username">Admin Username</label>
                    <input type="text" id="username" name="username" placeholder="e.g. asifadmin" required minlength="3" maxlength="40">
                </div>
                <div class="field">
                    <label for="password">Strong Password (min 10 chars)</label>
                    <input type="password" id="password" name="password" required minlength="10">
                </div>
                <div class="field">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required minlength="10">
                </div>
                <button type="submit" class="btn btn-primary btn-full">Create Admin Account</button>
            </form>
        <?php endif; ?>

        <div class="auth-footer">
            <a href="../index.php">&larr; Back to Public Website</a>
        </div>
    </div>
</body>
</html>
