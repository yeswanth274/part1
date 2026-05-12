const express = require('express')
const { Pool } = require('pg')
const Redis = require('ioredis')

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/postgres' })
const redis = new Redis({ host: process.env.REDIS_HOST || 'redis' })

const app = express()

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const port = process.env.PORT || 3000
app.listen(port)
