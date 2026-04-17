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

$user_id       = (int)($data['user_id'] ?? 0);
$items         = $data['items'] ?? [];
$discount_code = trim($data['discount_code'] ?? '');
$TAX_RATE      = 0.0825;

if (!$user_id) {
    echo json_encode(['error' => 'You must be logged in to place an order']);
    exit;
}

if (empty($items)) {
    echo json_encode(['error' => 'Cart is empty']);
    exit;
}

// Calculate subtotal
$subtotal = 0;
foreach ($items as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

// Check discount code
$discount_amount = 0;
if ($discount_code !== '') {
    $code = mysqli_real_escape_string($conn, $discount_code);
    $codeResult = mysqli_query($conn, "SELECT discount_percentage FROM DiscountCodes WHERE code = '$code' AND is_active = TRUE AND (expiration_date IS NULL OR expiration_date >= CURDATE())");
    $codeRow = mysqli_fetch_assoc($codeResult);
    if ($codeRow) {
        $discount_amount = round($subtotal * ($codeRow['discount_percentage'] / 100), 2);
    } else {
        echo json_encode(['error' => 'Invalid or expired discount code']);
        exit;
    }
}

$discounted_subtotal = $subtotal - $discount_amount;
$tax   = round($discounted_subtotal * $TAX_RATE, 2);
$total = round($discounted_subtotal + $tax, 2);

// Insert into Orders table
$sql = "INSERT INTO Orders (user_id, subtotal, tax, discount_amount, total)
        VALUES ('$user_id', '$subtotal', '$tax', '$discount_amount', '$total')";

if (!mysqli_query($conn, $sql)) {
    echo json_encode(['error' => 'Failed to place order']);
    exit;
}

$order_id = mysqli_insert_id($conn);

// Insert each item into OrderItems table
foreach ($items as $item) {
    $item_id  = (int)$item['item_id'];
    $quantity = (int)$item['quantity'];
    $price    = (float)$item['price'];

    $itemSql = "INSERT INTO OrderItems (order_id, item_id, quantity, price_at_purchase)
                VALUES ('$order_id', '$item_id', '$quantity', '$price')";
    mysqli_query($conn, $itemSql);

    // Reduce quantity available
    mysqli_query($conn, "UPDATE Items SET quantity_available = quantity_available - $quantity WHERE item_id = $item_id");
}

echo json_encode([
    'success'  => true,
    'order_id' => $order_id,
    'subtotal' => $subtotal,
    'discount' => $discount_amount,
    'tax'      => $tax,
    'total'    => $total
]);

mysqli_close($conn);
?>