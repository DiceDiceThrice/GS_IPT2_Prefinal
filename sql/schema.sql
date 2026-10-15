CREATE TABLE IF NOT EXISTS users (
 id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL, email VARCHAR(200) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL, role ENUM('admin','staff') NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS categories (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS suppliers (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL, email VARCHAR(200), phone VARCHAR(40), address VARCHAR(500), active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS customers (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL, email VARCHAR(200), phone VARCHAR(40), address VARCHAR(500), active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS products (
 id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL, category_id INT NOT NULL, description TEXT, material VARCHAR(200), image_url TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
 FOREIGN KEY(category_id) REFERENCES categories(id)
);
CREATE TABLE IF NOT EXISTS variants (
 id INT PRIMARY KEY AUTO_INCREMENT, product_id INT NOT NULL, sku VARCHAR(200) NOT NULL UNIQUE, color VARCHAR(200) NOT NULL, size VARCHAR(200) NOT NULL, dimensions VARCHAR(200),
 cost DECIMAL(12,2) NOT NULL, selling_price DECIMAL(12,2) NOT NULL, reorder_level INT NOT NULL DEFAULT 5, stock INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE,
 FOREIGN KEY(product_id) REFERENCES products(id), CHECK(stock >= 0), CHECK(cost >= 0), CHECK(selling_price >= 0)
);
CREATE TABLE IF NOT EXISTS orders (
 id INT PRIMARY KEY AUTO_INCREMENT, type ENUM('purchase','sale') NOT NULL, supplier_id INT, customer_id INT, total DECIMAL(16,2) NOT NULL, notes TEXT,
 created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(supplier_id) REFERENCES suppliers(id), FOREIGN KEY(customer_id) REFERENCES customers(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS order_items (
 id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, variant_id INT NOT NULL, quantity INT NOT NULL, returned_quantity INT NOT NULL DEFAULT 0, unit_price DECIMAL(12,2) NOT NULL,
 FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(variant_id) REFERENCES variants(id), CHECK(returned_quantity <= quantity)
);
CREATE TABLE IF NOT EXISTS stock_movements (
 id INT PRIMARY KEY AUTO_INCREMENT, variant_id INT NOT NULL, quantity INT NOT NULL, balance INT NOT NULL, type ENUM('purchase','sale','adjustment','sale_return','purchase_return') NOT NULL,
 order_id INT, reason VARCHAR(500), created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(variant_id) REFERENCES variants(id), FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(created_by) REFERENCES users(id), INDEX(variant_id,created_at)
);
CREATE TABLE IF NOT EXISTS returns (
 id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, total DECIMAL(16,2) NOT NULL, reason VARCHAR(500) NOT NULL, created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS return_items (
 id INT PRIMARY KEY AUTO_INCREMENT, return_id INT NOT NULL, order_item_id INT NOT NULL, quantity INT NOT NULL,
 FOREIGN KEY(return_id) REFERENCES returns(id), FOREIGN KEY(order_item_id) REFERENCES order_items(id)
);
