-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT
);

-- Insert sample products
INSERT INTO products (name, price, description, image_url, category) VALUES 
('Classic White Sneakers', 89.99, 'Timeless white sneakers for everyday wear', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', 'sneakers'),
('Leather Oxford Shoes', 129.99, 'Premium leather oxfords for formal occasions', 'https://images.pexels.com/photos/19090/pexels-photo.jpg', 'formal'),
('Running Shoes', 109.99, 'High-performance running shoes with cushioning', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 'sports'),
('Canvas Slip-ons', 49.99, 'Comfortable casual slip-on shoes', 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', 'casual'),
('Hiking Boots', 149.99, 'Durable boots for outdoor adventures', 'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg', 'outdoor'),
('Basketball Shoes', 119.99, 'High-top shoes for court performance', 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg', 'sports'),
('Loafers', 79.99, 'Comfortable slip-on loafers', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg', 'casual'),
('Sandals', 39.99, 'Breathable summer sandals', 'https://images.pexels.com/photos/2857045/pexels-photo-2857045.jpeg', 'summer');

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    total REAL,
    customer_name TEXT,
    customer_email TEXT,
    transaction_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);