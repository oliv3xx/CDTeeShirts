<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$code = mysqli_real_escape_string($conn, strtoupper(trim($_GET['code'] ?? '')));

if (!$code) {
    echo json_encode(['error' => 'No code provided']);
    exit;
}

$result = mysqli_query($conn, "SELECT discount_percentage FROM DiscountCodes WHERE code = '$code' AND is_active = TRUE AND (expiration_date IS NULL OR expiration_date >= CURDATE())");
$row = mysqli_fetch_assoc($result);

if ($row) {
    echo json_encode(['success' => true, 'discount_percentage' => $row['discount_percentage']]);
} else {
    echo json_encode(['error' => 'Invalid or expired discount code']);
}

mysqli_close($conn);
?>