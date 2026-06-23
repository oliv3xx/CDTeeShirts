const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

// DB connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to CDTeeShirts database.');
});

// GET /api/items — get all items
app.get('/api/items', (req, res) => {
    db.query('SELECT * FROM Items', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/items/:id — get single item
app.get('/api/items/:id', (req, res) => {
    db.query('SELECT * FROM Items WHERE item_id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json(results[0]);
    });
});

// GET /api/orders — get all orders with user info
app.get('/api/orders', (req, res) => {
    const sql = `
        SELECT o.order_id, u.username, o.order_date, 
               o.subtotal, o.tax, o.discount_amount, 
               o.total, o.status
        FROM Orders o
        JOIN Users u ON o.user_id = u.user_id
        ORDER BY o.order_date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/orders/:id — get single order with items
app.get('/api/orders/:id', (req, res) => {
    const sql = `
        SELECT oi.order_item_id, i.item_name, oi.quantity, 
               oi.price_at_purchase
        FROM OrderItems oi
        JOIN Items i ON oi.item_id = i.item_id
        WHERE oi.order_id = ?
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(results);
    });
});

// GET /api/discounts — get active discount codes
app.get('/api/discounts', (req, res) => {
    db.query('SELECT code, discount_percentage, expiration_date FROM DiscountCodes WHERE is_active = TRUE', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/status — health check
app.get('/api/status', (req, res) => {
    res.json({ status: 'running', app: 'CDTeeShirts API', version: '1.0' });
});

app.listen(PORT, () => {
    console.log(`CDTeeShirts API running on http://localhost:${PORT}`);
});