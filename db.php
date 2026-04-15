<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'sqlUser');
define('DB_PASS', '@bS0lvt3llyN07');
define('DB_NAME', 'tshirt_store');

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if (!$conn) {
    die(json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]));
}

mysqli_set_charset($conn, 'utf8');
?>