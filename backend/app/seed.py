import sys
import os
from pathlib import Path

# Add backend root to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.product import Product
from app.models.mandate import Mandate

SEED_PRODUCTS = [
    {
        "id": "prod_001",
        "name": "Sprint Runner",
        "description": "High-performance responsive lightweight running shoe with breathable mesh upper.",
        "price": 1299,
        "stock": 15,
        "category": "footwear",
        "attributes": {"type": "running", "sizes": ["7", "8", "9", "10"], "color": "Neon Lime / Black", "weight": "220g"}
    },
    {
        "id": "prod_002",
        "name": "Premium Runner",
        "description": "Elite carbon-plated marathon running shoes with maximum kinetic energy return.",
        "price": 1799,
        "stock": 8,
        "category": "footwear",
        "attributes": {"type": "running", "sizes": ["8", "9", "10", "11"], "color": "Carbon Black / Gold", "weight": "195g"}
    },
    {
        "id": "prod_003",
        "name": "Trail Blaze Pro",
        "description": "Rugged all-terrain trail shoes with high-traction Vibram-style outsole.",
        "price": 2499,
        "stock": 6,
        "category": "footwear",
        "attributes": {"type": "trail", "sizes": ["8", "9", "10"], "color": "Olive Green", "weight": "310g"}
    },
    {
        "id": "prod_004",
        "name": "Urban Sneaker Lite",
        "description": "Comfortable everyday lifestyle casual sneaker with memory foam cushioning.",
        "price": 999,
        "stock": 25,
        "category": "footwear",
        "attributes": {"type": "lifestyle", "sizes": ["7", "8", "9", "10"], "color": "Cloud White", "weight": "260g"}
    },
    {
        "id": "prod_005",
        "name": "SonicPulse Wireless Earbuds",
        "description": "Sweatproof sports earbuds with deep bass and 32-hour extended battery life.",
        "price": 1499,
        "stock": 12,
        "category": "electronics",
        "attributes": {"battery": "32h", "waterproof": "IPX7", "color": "Matte Black"}
    },
    {
        "id": "prod_006",
        "name": "ProGrip Resistance Bands",
        "description": "5-pack heavy-duty resistance loop exercise bands for home and gym conditioning.",
        "price": 699,
        "stock": 30,
        "category": "fitness",
        "attributes": {"levels": ["X-Light", "Light", "Medium", "Heavy", "X-Heavy"], "material": "Natural Latex"}
    },
    {
        "id": "prod_007",
        "name": "Thermal Hydration Flask",
        "description": "Double-wall vacuum insulated stainless steel sports water bottle.",
        "price": 499,
        "stock": 40,
        "category": "accessories",
        "attributes": {"capacity": "750ml", "insulation": "24h Cold / 12h Hot", "color": "Steel Blue"}
    },
    {
        "id": "prod_008",
        "name": "AeroFit Performance Tee",
        "description": "Ultra-light moisture-wicking athletic t-shirt with anti-odor silver ion weave.",
        "price": 899,
        "stock": 20,
        "category": "clothing",
        "attributes": {"sizes": ["S", "M", "L", "XL"], "fabric": "DryFit Micro-Poly", "color": "Charcoal Grey"}
    },
    {
        "id": "prod_009",
        "name": "Apex Smart Fitness Tracker",
        "description": "Activity band with AMOLED touch display, continuous heart rate and blood oxygen monitoring.",
        "price": 2199,
        "stock": 7,
        "category": "electronics",
        "attributes": {"display": "1.47-inch AMOLED", "sensors": ["HeartRate", "SpO2", "Sleep"], "color": "Midnight Black"}
    },
    {
        "id": "prod_010",
        "name": "Phantom Sprint Elite",
        "description": "Special edition lightweight track shoe (Currently sold out for stock boundary testing).",
        "price": 1450,
        "stock": 0,
        "category": "footwear",
        "attributes": {"type": "track", "sizes": ["9", "10"], "note": "Out of stock for testing"}
    }
]

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Seed Products
        for p_data in SEED_PRODUCTS:
            existing = db.query(Product).filter(Product.id == p_data["id"]).first()
            if not existing:
                product = Product(**p_data)
                db.add(product)
            else:
                # Update attributes / stock / price
                for k, v in p_data.items():
                    setattr(existing, k, v)
        
        # Seed Default Mandate
        demo_mandate = db.query(Mandate).filter(Mandate.id == "mandate_demo").first()
        if not demo_mandate:
            mandate = Mandate(
                id="mandate_demo",
                merchant_id="merchant_demo",
                max_amount=1500,
                allowed_categories=["footwear"],
                max_items_per_order=1,
                expires_at=datetime.now(timezone.utc) + timedelta(days=180),
                status="active"
            )
            db.add(mandate)
        else:
            demo_mandate.max_amount = 1500
            demo_mandate.allowed_categories = ["footwear"]
            demo_mandate.max_items_per_order = 1
            demo_mandate.status = "active"

        db.commit()
        print("Database seeded successfully with products and demo mandate.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
