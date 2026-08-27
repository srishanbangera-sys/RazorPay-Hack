import pytest
from datetime import datetime, timedelta, timezone
from app.mandate_engine.models import (
    ProductData,
    CartItemData,
    MandateData,
    CheckoutAction
)
from app.mandate_engine.engine import evaluate_mandate

@pytest.fixture
def base_mandate():
    return MandateData(
        id="mandate_demo",
        merchant_id="merchant_demo",
        max_amount=1500,
        allowed_categories=["footwear", "sports"],
        max_items_per_order=2,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        status="active"
    )

@pytest.fixture
def sprint_runner():
    return ProductData(
        id="prod_001",
        name="Sprint Runner",
        price=1299,
        stock=10,
        category="footwear"
    )

@pytest.fixture
def premium_runner():
    return ProductData(
        id="prod_002",
        name="Premium Runner",
        price=1799,
        stock=5,
        category="footwear"
    )

@pytest.fixture
def earbuds():
    return ProductData(
        id="prod_005",
        name="Wireless Earbuds",
        price=1499,
        stock=8,
        category="electronics"
    )

class TestMandateEngine:
    def test_amount_below_limit_approved(self, base_mandate, sprint_runner):
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=sprint_runner, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is True
        assert decision.code == "MANDATE_APPROVED"
        assert decision.details["cart_total"] == 1299

    def test_amount_equal_to_limit_approved(self, base_mandate):
        exact_shoe = ProductData(
            id="prod_exact",
            name="Exact Limit Shoe",
            price=1500,
            stock=5,
            category="footwear"
        )
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=exact_shoe, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is True
        assert decision.code == "MANDATE_APPROVED"
        assert decision.details["cart_total"] == 1500

    def test_amount_above_limit_rejected(self, base_mandate, premium_runner):
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=premium_runner, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "MANDATE_EXCEEDED"
        assert decision.details["cart_total"] == 1799
        assert decision.details["max_amount"] == 1500
        assert decision.details["difference"] == 299

    def test_category_allowed_approved(self, base_mandate, sprint_runner):
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=sprint_runner, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is True

    def test_category_disallowed_rejected(self, base_mandate, earbuds):
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=earbuds, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "CATEGORY_NOT_ALLOWED"
        assert decision.details["product_category"] == "electronics"

    def test_item_count_within_limit_approved(self, base_mandate):
        cheap_sock = ProductData(
            id="prod_sock",
            name="Athletic Sock",
            price=200,
            stock=10,
            category="footwear"
        )
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=cheap_sock, quantity=2)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is True

    def test_item_count_exceeded_rejected(self, base_mandate):
        cheap_sock = ProductData(
            id="prod_sock",
            name="Athletic Sock",
            price=200,
            stock=10,
            category="footwear"
        )
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=cheap_sock, quantity=3)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "MAX_ITEMS_EXCEEDED"
        assert decision.details["total_quantity"] == 3
        assert decision.details["max_items_per_order"] == 2

    def test_mandate_expired_rejected(self, base_mandate, sprint_runner):
        base_mandate.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=sprint_runner, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "MANDATE_EXPIRED"

    def test_merchant_mismatch_rejected(self, base_mandate, sprint_runner):
        action = CheckoutAction(
            merchant_id="foreign_merchant",
            items=[CartItemData(product=sprint_runner, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "MERCHANT_NOT_ALLOWED"

    def test_out_of_stock_rejected(self, base_mandate):
        out_of_stock_item = ProductData(
            id="prod_oos",
            name="Sold Out Runner",
            price=1200,
            stock=0,
            category="footwear"
        )
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=out_of_stock_item, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "OUT_OF_STOCK"
        assert decision.details["available_stock"] == 0

    def test_inactive_mandate_rejected(self, base_mandate, sprint_runner):
        base_mandate.status = "inactive"
        action = CheckoutAction(
            merchant_id="merchant_demo",
            items=[CartItemData(product=sprint_runner, quantity=1)]
        )
        decision = evaluate_mandate(action, base_mandate)
        assert decision.allowed is False
        assert decision.code == "MANDATE_INACTIVE"
