CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);

INSERT INTO products (sku, name, description, price, stock)
SELECT 'SKU-'||i, 'Product '||i, 'Seed product', (i % 100) + 10, 100
FROM generate_series(1,200) s(i)
ON CONFLICT DO NOTHING;
