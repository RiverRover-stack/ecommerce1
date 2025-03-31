-- Optimized products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT NOT NULL,
    stock INTEGER DEFAULT 0
);

-- Sample products
INSERT INTO products (name, price, image_url, stock) VALUES 
('Classic White Sneakers', 89.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', 10),
('Leather Oxford Shoes', 129.99, 'https://images.pexels.com/photos/19090/pexels-photo.jpg', 5),
('Running Shoes', 109.99, 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 8);

-- Optimized users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Orders table replaces transactions
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
