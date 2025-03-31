const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
const dbPath = path.join(__dirname, 'db/shoe_store.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX, (err) => {
    console.log(`Using database at: ${dbPath}`);
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER,
        total REAL,
        customer_name TEXT,
        customer_email TEXT,
        transaction_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);
});

// API Endpoints
// Get all available products
app.get('/api/products', (req, res) => {
    db.all('SELECT id, name, price, image_url, stock, description, category, rating, featured FROM products WHERE stock > 0', [], (err, products) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
        res.json(products);
    });
});

// Get product details
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT id, name, price, image_url as image, stock FROM products WHERE id = ?', 
        [req.params.id], (err, product) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch product' });
            }
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        });
});

app.post('/api/cart', (req, res) => {
    const { productId } = req.body;
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(row);
    });
});

// User registration endpoint
app.post('/api/signup', express.json(), async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    throw err;
                }
                res.status(201).json({ message: 'User created successfully' });
            }
        );
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login endpoint
// Configure JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-consistent-secret-key-here';

app.post('/api/login', express.json(), async (req, res) => {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Create JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email 
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Store session
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour
            db.run(
                'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
                [user.id, token, expiresAt.toISOString()],
                function(err) {
                    if (err) {
                        console.error('Session error:', err);
                        return res.status(500).json({ error: 'Could not create session' });
                    }
                    
                    res.json({ 
                        success: true,
                        token,
                        userId: user.id,
                        email: user.email,
                        expiresAt: expiresAt.toISOString()
                    });
                }
            );
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user orders
app.get('/api/orders', (req, res) => {
    const userId = req.query.userId;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    db.all(`
        SELECT t.id, t.total, t.transaction_date, 
               p.name, p.price, p.image_url, 
               ti.quantity
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        WHERE t.customer_email IN (
            SELECT email FROM users WHERE id = ?
        )
        ORDER BY t.transaction_date DESC
    `, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Group items by order
        const orders = {};
        rows.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = {
                    id: row.id,
                    total: row.total,
                    transaction_date: row.transaction_date,
                    items: []
                };
            }
            orders[row.id].items.push({
                name: row.name,
                price: row.price,
                image_url: row.image_url,
                quantity: row.quantity
            });
        });

        res.json(Object.values(orders));
    });
});

app.post('/api/checkout', (req, res) => {
    const { items, customer } = req.body;
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Insert transaction
    const stmt = db.prepare('INSERT INTO transactions (product_id, quantity, total, customer_name, customer_email) VALUES (?, ?, ?, ?, ?)');
    
    items.forEach(item => {
        stmt.run(item.id, item.quantity, total, customer.name, customer.email);
    });
    
    stmt.finalize(err => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: 'Order placed successfully' });
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});