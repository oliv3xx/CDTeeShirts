CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address VARCHAR(255),
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity_available INT NOT NULL,
    image_url VARCHAR(255),
    is_on_sale BOOLEAN DEFAULT FALSE,
    sale_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DiscountCodes (
    code_id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE OrderItems (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id)
);

CREATE TABLE Cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id)
);

-- Insert test admin user
INSERT INTO Users (username, password, email, first_name, last_name, is_admin) 
VALUES ('admin', 'admin123', 'admin@cdteeshirts.com', 'Admin', 'User', TRUE);

-- Insert regular test user
INSERT INTO Users (username, password, email, first_name, last_name, is_admin) 
VALUES ('testuser', 'password123', 'test@email.com', 'Test', 'User', FALSE);

-- Insert t-shirts with real image URLs
INSERT INTO Items (item_name, description, price, quantity_available, image_url) 
VALUES 
('Black Oversized Essential Tee', 'Classic black oversized tee, comfortable cotton blend', 35.00, 50, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=830&auto=format&fit=crop'),
('White Classic Blank Tee', 'Clean white essential tee, perfect for any occasion', 32.00, 50, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=774&auto=format&fit=crop'),
('Red Street Heavyweight Tee', 'Bold red heavyweight tee for a statement look', 38.00, 30, 'https://plus.unsplash.com/premium_photo-1691367279053-ffa6edf80181?w=400&auto=format&fit=crop&q=60'),
('Navy Minimal Blank Tee', 'Navy blue minimal tee, versatile and clean', 30.00, 40, 'https://plus.unsplash.com/premium_photo-1689565524694-88720c282271?w=400&auto=format&fit=crop&q=60'),
('Forest Green Boxy Tee', 'Forest green boxy fit tee, relaxed and stylish', 40.00, 25, 'https://images.unsplash.com/photo-1706550633351-293b55daccf4?w=400&auto=format&fit=crop&q=60'),
('Beige Vintage Washed Tee', 'Beige vintage washed tee with a retro feel', 34.00, 35, 'https://plus.unsplash.com/premium_photo-1671656349262-1e1d3e09735c?w=400&auto=format&fit=crop&q=60');

-- Insert a test discount code
INSERT INTO DiscountCodes (code, discount_percentage, expiration_date) 
VALUES ('SAVE10', 10.00, '2026-12-31');