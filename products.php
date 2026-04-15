<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$sort = isset($_GET['sort']) ? $_GET['sort'] : '';

// Base query
$sql = "SELECT item_id, item_name, description, price, quantity_available, image_url, is_on_sale, sale_price FROM Items WHERE 1=1";

// Search by name or description
if ($search !== '') {
    $sql .= " AND (item_name LIKE '%$search%' OR description LIKE '%$search%')";
}

// Sort options
if ($sort === 'price_asc') {
    $sql .= " ORDER BY price ASC";
} else if ($sort === 'price_desc') {
    $sql .= " ORDER BY price DESC";
} else if ($sort === 'availability') {
    $sql .= " ORDER BY quantity_available DESC";
} else {
    $sql .= " ORDER BY item_id ASC";
}

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['error' => 'Query failed']);
    exit;
}

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

echo json_encode($products);
mysqli_close($conn);
?>