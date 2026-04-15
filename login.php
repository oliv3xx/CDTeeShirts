<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'POST method required']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$username = mysqli_real_escape_string($conn, trim($data['username'] ?? ''));
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(['error' => 'Username and password are required']);
    exit;
}

$sql = "SELECT user_id, username, password, first_name, last_name, is_admin FROM Users WHERE username = '$username'";
$result = mysqli_query($conn, $sql);
$user = mysqli_fetch_assoc($result);

if ($user && password_verify($password, $user['password'])) {
    // Store user info in session
    $_SESSION['user_id']   = $user['user_id'];
    $_SESSION['username']  = $user['username'];
    $_SESSION['is_admin']  = $user['is_admin'];

    echo json_encode([
        'success'    => true,
        'user_id'    => $user['user_id'],
        'username'   => $user['username'],
        'first_name' => $user['first_name'],
        'is_admin'   => $user['is_admin']
    ]);
} else {
    echo json_encode(['error' => 'Invalid username or password']);
}

mysqli_close($conn);
?>