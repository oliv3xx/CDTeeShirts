<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - return all users
if ($method === 'GET') {
    $result = mysqli_query($conn, "SELECT user_id, username, email, first_name, last_name, is_admin, created_at FROM Users ORDER BY user_id ASC");
    $users  = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
    echo json_encode($users);
}

// POST - update user
else if ($method === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true);
    $id        = (int)($data['user_id'] ?? 0);
    $username  = mysqli_real_escape_string($conn, $data['username'] ?? '');
    $email     = mysqli_real_escape_string($conn, $data['email'] ?? '');
    $firstName = mysqli_real_escape_string($conn, $data['first_name'] ?? '');
    $lastName  = mysqli_real_escape_string($conn, $data['last_name'] ?? '');
    $isAdmin   = isset($data['is_admin']) ? (int)$data['is_admin'] : 0;

    $sql = "UPDATE Users SET username='$username', email='$email',
            first_name='$firstName', last_name='$lastName', is_admin='$isAdmin'
            WHERE user_id=$id";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => mysqli_error($conn)]);
    }
}

// DELETE - remove user
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['user_id'] ?? 0);

    if (mysqli_query($conn, "DELETE FROM Users WHERE user_id=$id")) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => mysqli_error($conn)]);
    }
}

mysqli_close($conn);
?>