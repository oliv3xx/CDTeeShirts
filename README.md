# CDTeeShirts E-Commerce Platform

A full-stack e-commerce web application for a t-shirt store, built with PHP, 
MySQL, and JavaScript — deployed on Microsoft Azure VM.

## Overview

Built as a team project using Agile/Scrum methodology. I served as Scrum Master 
for a team of 6, coordinating sprint planning, managing integrations between 
team members' modules, and keeping deliverables on time.

## Features

### Customer-Facing
- Product browsing and search
- Shopping cart with quantity management
- Discount code validation at checkout
- Tax calculation and order summary
- User registration and login
- Order history

### Admin Panel
- Manage products (add, edit, delete)
- Manage orders and update order status
- Manage users
- Manage discount codes

### Security
- Password hashing with bcrypt via PHP's `password_hash`
- Role-based access control (admin vs. regular user) using session variables
- Parameterized queries to prevent SQL injection
- Least-privilege database access — separate user accounts per role

### REST API (Node.js + Express)
- `GET /api/items` — retrieve all products
- `GET /api/items/:id` — retrieve single product
- `GET /api/orders` — retrieve all orders with user info
- `GET /api/orders/:id` — retrieve order line items
- `GET /api/discounts` — retrieve active discount codes
- `GET /api/status` — health check endpoint

## Tech Stack
- **Backend:** PHP, Node.js, Express
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **Auth:** bcrypt password hashing, session management
- **Deployment:** Microsoft Azure VM (Apache)
- **API:** REST, JSON
- **Tools:** Git, VS Code, MySQL Workbench

## Database Schema
- `Users` — customer and admin accounts
- `Items` — product catalog with pricing and sale support
- `Orders` — order records with subtotal, tax, discount, and total
- `OrderItems` — line items linking orders to products
- `Cart` — active cart items per user
- `DiscountCodes` — promo codes with expiration and percentage off

## Project Structure
- `shop.html` / `items.html` — product browsing
- `cart.html` / `checkout.html` — cart and checkout flow
- `orders.html` / `orders.php` — order management
- `login.html` / `login.php` / `register.php` — authentication
- `dashboard.html` — user dashboard
- `admin_*.php` — admin panel for products, orders, users, discounts
- `api.js` — Node.js Express REST API
- `tshirt_store.sql` — database schema and seed data

## Setup

1. Import `tshirt_store.sql` into MySQL
2. Configure database credentials in `db.php`
3. Deploy PHP files to an Apache server
4. For the Node.js API, create a `.env` file:
```bash
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_password
DB_NAME=tshirt_store
```

5. Run the API:
```bash
npm install
node api.js
```

## Team
Built with a team of 6 using Agile/Scrum. Role: Scrum Master.