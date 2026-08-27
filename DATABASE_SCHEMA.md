# Database Schema

## products

| Column | Type | Notes |
|---|---|---|
| id | string/UUID | Primary key |
| name | string | Product name |
| description | text | Product description |
| price | integer/decimal | Store money safely |
| stock | integer | Available quantity |
| category | string | Product category |
| attributes | JSON | Structured metadata |
| created_at | datetime | Creation time |

## mandates

| Column | Type | Notes |
|---|---|---|
| id | string/UUID | Primary key |
| merchant_id | string | Allowed merchant |
| max_amount | integer/decimal | Spending limit |
| allowed_categories | JSON | Allowed categories |
| max_items_per_order | integer | Quantity limit |
| expires_at | datetime | Expiry |
| status | string | active/inactive |
| created_at | datetime | Creation time |

## orders

| Column | Type | Notes |
|---|---|---|
| id | string/UUID | Primary key |
| mandate_id | FK | Mandate used |
| merchant_id | string | Merchant |
| amount | integer/decimal | Server-calculated |
| status | string | proposed/approved/payment_pending/paid/failed/rejected |
| razorpay_order_id | string | External reference |
| trace_id | string | Correlation ID |
| created_at | datetime | Creation time |

## order_items

| Column | Type |
|---|---|
| id | string/UUID |
| order_id | FK |
| product_id | FK |
| quantity | integer |
| unit_price | integer/decimal |

## payments

| Column | Type |
|---|---|
| id | string/UUID |
| order_id | FK |
| provider | string |
| provider_payment_id | string |
| provider_order_id | string |
| amount | integer/decimal |
| status | string |
| raw_reference | JSON |
| created_at | datetime |

## audit_events

This table is append-only.

| Column | Type | Notes |
|---|---|---|
| id | string/UUID | Primary key |
| trace_id | string | Correlation |
| timestamp | datetime | Event time |
| actor | string | buyer/agent/backend/payment |
| event_type | string | Event category |
| action | string | Action |
| decision | string | approved/rejected/info |
| reason_code | string | Structured reason |
| input_data | JSON | Relevant sanitized input |
| output_data | JSON | Relevant result |
| order_id | FK nullable | Related order |
| payment_id | FK nullable | Related payment |

## Recommended Event Types

- USER_REQUEST
- CATALOG_SEARCH
- PRODUCTS_RETURNED
- CART_PROPOSED
- MANDATE_CHECK_STARTED
- MANDATE_APPROVED
- MANDATE_REJECTED
- ORDER_CREATED
- RAZORPAY_ORDER_CREATED
- PAYMENT_SUCCEEDED
- PAYMENT_FAILED
- ALTERNATIVE_PROPOSED
