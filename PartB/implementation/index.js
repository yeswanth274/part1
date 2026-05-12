const express = require('express')
const { Pool } = require('pg')
const Redis = require('ioredis')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/postgres' })
const redis = new Redis({ host: process.env.REDIS_HOST || 'redis' })

const app = express()
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

app.get('/api/products', async (req, res) => {
  try {
    const cache = await redis.get('products:all')
    if (cache) {
      res.set('X-Cache','HIT')
      return res.json(JSON.parse(cache))
    }
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT id, sku, name, price FROM products ORDER BY id LIMIT 200')
      const payload = { items: result.rows }
      await redis.set('products:all', JSON.stringify(payload), 'EX', 300)
      res.set('X-Cache','MISS')
      return res.json(payload)
    } finally {
      client.release()
    }
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { email, name, password } = req.body || {}
  if (!email || !name || !password) return res.status(400).json({ error: { code: 'INVALID_INPUT' } })
  const client = await pool.connect()
  try {
    const hash = await bcrypt.hash(password, 10)
    await client.query('INSERT INTO users(email,name,password_hash) VALUES($1,$2,$3)', [email, name, hash])
    return res.status(201).json({ success: true })
  } catch (e) {
    return res.status(400).json({ error: { code: 'USER_EXISTS' } })
  } finally { client.release() }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: { code: 'INVALID_INPUT' } })
  const client = await pool.connect()
  try {
    const r = await client.query('SELECT id,password_hash FROM users WHERE email=$1', [email])
    const user = r.rows[0]
    if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } })
    const ok = await bcrypt.compare(password, user.password_hash || '')
    if (!ok) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } })
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '6h' })
    return res.json({ token })
  } finally { client.release() }
})

const auth = (req, res, next) => {
  const h = req.headers.authorization || ''
  const m = h.match(/^Bearer\s+(.*)$/i)
  if (!m) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } })
  try {
    const payload = jwt.verify(m[1], JWT_SECRET)
    req.user = { id: payload.sub }
    return next()
  } catch (e) { return res.status(401).json({ error: { code: 'UNAUTHORIZED' } }) }
}

app.get('/api/orders/history', auth, async (req, res) => {
  const userId = req.user.id
  const client = await pool.connect()
  try {
    const orders = await client.query('SELECT id,total_amount,status,created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [userId])
    const ids = orders.rows.map(r => r.id)
    if (ids.length === 0) return res.json({ items: [] })
    const items = await client.query('SELECT oi.order_id, oi.product_id, oi.unit_price_at_purchase, oi.quantity, p.name FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id = ANY($1::int[])', [ids])
    const map = {}
    for (const o of orders.rows) map[o.id] = { ...o, items: [] }
    for (const it of items.rows) map[it.order_id].items.push(it)
    return res.json({ items: Object.values(map) })
  } finally { client.release() }
})

app.post('/api/cart/checkout', auth, async (req, res) => {
  const userId = req.user.id
  const { items, coupon_code } = req.body || {}
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: { code: 'INVALID_ORDER' } })
  const client = await pool.connect()
  const lockKey = coupon_code ? `coupon:lock:${coupon_code}` : null
  try {
    if (lockKey) {
      const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 5)
      if (!acquired) return res.status(409).json({ error: { code: 'COUPON_IN_USE' } })
    }
    await client.query('BEGIN')
    let total = 0
    for (const it of items) {
      const p = await client.query('SELECT id,price,stock FROM products WHERE id=$1 FOR UPDATE', [it.product_id])
      const prod = p.rows[0]
      if (!prod) { await client.query('ROLLBACK'); return res.status(400).json({ error: { code: 'INVALID_PRODUCT' } }) }
      if (prod.stock < it.quantity) { await client.query('ROLLBACK'); return res.status(409).json({ error: { code: 'OUT_OF_STOCK' } }) }
      total += Number(prod.price) * Number(it.quantity)
      await client.query('UPDATE products SET stock = stock - $1 WHERE id=$2', [it.quantity, it.product_id])
    }
    const orderR = await client.query('INSERT INTO orders(user_id,total_amount,status) VALUES($1,$2,$3) RETURNING id', [userId, total, 'created'])
    const orderId = orderR.rows[0].id
    for (const it of items) {
      const prod = await client.query('SELECT price FROM products WHERE id=$1', [it.product_id])
      const price = prod.rows[0].price
      await client.query('INSERT INTO order_items(order_id,product_id,unit_price_at_purchase,quantity) VALUES($1,$2,$3,$4)', [orderId, it.product_id, price, it.quantity])
    }
    await client.query('COMMIT')
    if (lockKey) await redis.del(lockKey)
    await redis.del('products:all')
    return res.status(201).json({ order_id: orderId })
  } catch (e) {
    await client.query('ROLLBACK')
    if (lockKey) await redis.del(lockKey)
    return res.status(500).json({ error: { code: 'SERVER_ERROR' } })
  } finally { client.release() }
})

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const port = process.env.PORT || 3000
app.listen(port)
