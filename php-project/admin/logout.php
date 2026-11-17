<?php
declare(strict_types=1);

define('ASIF_APP', true);
require_once __DIR__ . '/../config/security.php';

logoutAdminSession();
header('Location: login.php');
exit;
