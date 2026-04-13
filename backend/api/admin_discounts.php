<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - return all discount codes
if ($method === 'GET') {
    $result = mysqli_query($conn, "SELECT * FROM DiscountCodes ORDER BY code_id ASC");
    $codes  = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $codes[] = $row;
    }
    echo json_encode($codes);
}

// POST - add new code
else if ($method === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $code    = mysqli_real_escape_string($conn, strtoupper(trim($data['code'] ?? '')));
    $percent = (float)($data['discount_percentage'] ?? 0);
    $expiry  = $data['expiration_date'] ? "'" . mysqli_real_escape_string($conn, $data['expiration_date']) . "'" : 'NULL';
    $active  = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    $sql = "INSERT INTO DiscountCodes (code, discount_percentage, expiration_date, is_active)
            VALUES ('$code', '$percent', $expiry, '$active')";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Code already exists or invalid input.']);
    }
}

// DELETE - remove code
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['code_id'] ?? 0);

    if (mysqli_query($conn, "DELETE FROM DiscountCodes WHERE code_id=$id")) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => mysqli_error($conn)]);
    }
}

mysqli_close($conn);
?>