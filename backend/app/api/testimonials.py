from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/testimonials", tags=["Testimonials & Social"])

TESTIMONIALS_DATA = [
    {
        "id": "t1",
        "author": "Eleanor Vance",
        "location": "Edinburgh, UK",
        "title": "Unrivalled Quality & Aroma",
        "content": "The pyramid mesh teabags allow the full leaf to unfurl completely. Teddy Bear's Choice is an absolute delight for afternoon tea.",
        "rating": 5,
        "product_name": "Teddy Bear's Choice Fruit Tea",
        "verified_buyer": True,
        "date": "2 days ago"
    },
    {
        "id": "t2",
        "author": "Marcus Sterling",
        "location": "London, UK",
        "title": "Best Harrogate Everyday Blend",
        "content": "A bold, robust breakfast cuppa that puts ordinary store bags to shame. Fast UPS delivery and pristine freshness.",
        "rating": 5,
        "product_name": "Yorkshire Harrogate Everyday Tea",
        "verified_buyer": True,
        "date": "1 week ago"
    },
    {
        "id": "t3",
        "author": "Sophia Dupont",
        "location": "Paris, France",
        "title": "Zesty & Refreshing Rooibos",
        "content": "Naturally caffeine-free with the cleanest citrus notes. The biodegradable pyramid mesh is environmentally wonderful.",
        "rating": 5,
        "product_name": "Zesty Lemon Rooibos Tea",
        "verified_buyer": True,
        "date": "2 weeks ago"
    }
]

SOCIAL_FEED_DATA = [
    {
        "id": "s1",
        "handle": "@tea_sommelier_uk",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
        "caption": "Steeping morning clarity with @jenierteas Earl Grey Supreme. Whole bergamot notes expanding in mesh pyramids! ✨🫖",
        "likes": 428,
        "tag": "#JenierTeas"
    },
    {
        "id": "s2",
        "handle": "@botanical_brew",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80",
        "caption": "Afternoon iced infusion with Teddy Bear's Choice dried berries and hibiscus. Pure ruby red heaven. 🍓🌺",
        "likes": 612,
        "tag": "#WorldOfTeas"
    },
    {
        "id": "s3",
        "handle": "@zen_ceremony",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        "image": "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=500&auto=format&fit=crop&q=80",
        "caption": "Frothing up our ceremonial grade Uji matcha in the handcrafted bowl. Unbeatable vibrant emerald hue! 🍵",
        "likes": 895,
        "tag": "#MatchaRitual"
    }
]

@router.get("")
def get_testimonials_and_social():
    return {
        "testimonials": TESTIMONIALS_DATA,
        "social_feed": SOCIAL_FEED_DATA
    }
