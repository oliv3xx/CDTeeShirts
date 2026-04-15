<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'POST method required']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$username  = mysqli_real_escape_string($conn, trim($data['username'] ?? ''));
$email     = mysqli_real_escape_string($conn, trim($data['email'] ?? ''));
$password  = $data['password'] ?? '';
$firstName = mysqli_real_escape_string($conn, trim($data['first_name'] ?? ''));
$lastName  = mysqli_real_escape_string($conn, trim($data['last_name'] ?? ''));

// Basic validation
if (!$username || !$email || !$password) {
    echo json_encode(['error' => 'Username, email, and password are required']);
    exit;
}

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO Users (username, password, email, first_name, last_name)
        VALUES ('$username', '$hashedPassword', '$email', '$firstName', '$lastName')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Account created successfully']);
} else {
    // Likely a duplicate username or email
    echo json_encode(['error' => 'Username or email already exists']);
}

mysqli_close($conn);
?>