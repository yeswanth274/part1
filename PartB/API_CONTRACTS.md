Standard error response

{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": null
  }
}

GET /api/products
Request: query params: page, limit, q
Response 200: { items: [{id, sku, name, price}], page, limit, total }
Response 5xx: Standard error response

GET /api/products/:id
Response 200: { id, sku, name, description, price, stock }
Response 404: { error: { code: "NOT_FOUND", message: "Product not found" } }

POST /api/auth/login
Request: { email, password }
Response 200: { token }
Response 401: { error: { code: "UNAUTHORIZED" } }

GET /api/orders/history
Auth required: Bearer token
Response 200: { items: [{order}, ...], page, limit }

POST /api/cart/checkout
Auth required
Request: { items: [{product_id, quantity}], coupon_code? }
Response 201: { order_id }
Response 400: { error: { code: "INVALID_ORDER" } }
Response 409: { error: { code: "OUT_OF_STOCK" } }

PATCH /api/orders/:id/status
Admin auth required
Request: { status }
Response 200: { id, status }

GET /api/health
Response 200: { status: "ok" }
