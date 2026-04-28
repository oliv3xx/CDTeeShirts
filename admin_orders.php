<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST - update order status
if ($method === 'POST') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $order_id = (int)($data['order_id'] ?? 0);
    $status   = mysqli_real_escape_string($conn, $data['status'] ?? 'pending');

    $allowed = ['pending', 'complete', 'cancelled'];
    if (!in_array($status, $allowed)) {
        echo json_encode(['error' => 'Invalid status']);
        exit;
    }

    if (mysqli_query($conn, "UPDATE Orders SET status='$status' WHERE order_id=$order_id")) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => mysqli_error($conn)]);
    }
    exit;
}

// Allowed sort columns to prevent SQL injection
$allowed_sorts = [
    'order_date DESC',
    'order_date ASC',
    'username ASC',
    'total DESC',
    'total ASC'
];

$sort = $_GET['sort'] ?? 'order_date DESC';
if (!in_array($sort, $allowed_sorts)) {
    $sort = 'order_date DESC';
}

// Get all orders with username
$orders_sql = "SELECT o.order_id, u.username, o.order_date, o.subtotal, o.tax,
               o.discount_amount, o.total, o.status
               FROM Orders o
               JOIN Users u ON o.user_id = u.user_id
               ORDER BY $sort";

$result = mysqli_query($conn, $orders_sql);
$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

// Get summary stats
$stats = [];
$statsResult = mysqli_query($conn, "SELECT COUNT(*) as total_orders, SUM(total) as total_revenue FROM Orders");
$statsRow    = mysqli_fetch_assoc($statsResult);
$stats['total_orders']   = $statsRow['total_orders'];
$stats['total_revenue']  = $statsRow['total_revenue'] ?? 0;

$usersResult = mysqli_query($conn, "SELECT COUNT(*) as total_users FROM Users");
$usersRow    = mysqli_fetch_assoc($usersResult);
$stats['total_users'] = $usersRow['total_users'];

$itemsResult = mysqli_query($conn, "SELECT COUNT(*) as total_items FROM Items");
$itemsRow    = mysqli_fetch_assoc($itemsResult);
$stats['total_items'] = $itemsRow['total_items'];

echo json_encode(['orders' => $orders, 'stats' => $stats]);
mysqli_close($conn);
?>