<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - return all items
if ($method === 'GET') {
    $result = mysqli_query($conn, "SELECT * FROM Items ORDER BY item_id ASC");
    $items  = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    echo json_encode($items);
}

// POST - add or update item
else if ($method === 'POST') {
    $data  = json_decode(file_get_contents('php://input'), true);
    $id    = isset($data['item_id']) && $data['item_id'] !== '' ? (int)$data['item_id'] : null;
    $name  = mysqli_real_escape_string($conn, $data['item_name'] ?? '');
    $desc  = mysqli_real_escape_string($conn, $data['description'] ?? '');
    $price = (float)($data['price'] ?? 0);
    $qty   = (int)($data['quantity_available'] ?? 0);
    $img   = mysqli_real_escape_string($conn, $data['image_url'] ?? '');
    $sale  = isset($data['is_on_sale']) ? (int)$data['is_on_sale'] : 0;
    $salePrice = $data['sale_price'] !== '' ? (float)$data['sale_price'] : 'NULL';

    if ($id) {
        $sql = "UPDATE Items SET item_name='$name', description='$desc', price='$price',
                quantity_available='$qty', image_url='$img', is_on_sale='$sale',
                sale_price=" . ($salePrice === 'NULL' ? 'NULL' : "'$salePrice'") . "
                WHERE item_id=$id";
    } else {
        $sql = "INSERT INTO Items (item_name, description, price, quantity_available, image_url, is_on_sale, sale_price)
                VALUES ('$name', '$desc', '$price', '$qty', '$img', '$sale',
                " . ($salePrice === 'NULL' ? 'NULL' : "'$salePrice'") . ")";
    }

    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => mysqli_error($conn)]);
    }
}

// DELETE - remove item
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['item_id'] ?? 0);

    if (mysqli_query($conn, "DELETE FROM Items WHERE item_id=$id")) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => mysqli_error($conn)]);
    }
}

mysqli_close($conn);
?>