"""
Referral Links für Bewerbungen
- Admin erstellt einen Link wie /bewerbungen/{slug}
- Klicks und resultierende Bewerbungen werden getrackt
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import decode_token
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import re
import uuid

router = APIRouter(prefix="/api/referrals", tags=["referrals"])


def get_db():
    from server import db
    return db


def verify_admin(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins")
    return payload


SLUG_RE = re.compile(r"^[a-zA-Z0-9_-]{3,40}$")


class CreateReferral(BaseModel):
    slug: str
    name: Optional[str] = None
    notes: Optional[str] = None


# ============ ADMIN ENDPOINTS ============

@router.post("/")
async def create_referral(
    data: CreateReferral,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new referral link"""
    verify_admin(authorization)

    slug = (data.slug or "").strip().lower()
    if not SLUG_RE.match(slug):
        raise HTTPException(
            status_code=400,
            detail="Slug muss 3-40 Zeichen lang sein (a-z, 0-9, _, -)",
        )

    existing = await db.referrals.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug bereits vergeben")

    doc = {
        "id": f"ref-{uuid.uuid4().hex[:8]}",
        "slug": slug,
        "name": (data.name or "").strip(),
        "notes": (data.notes or "").strip(),
        "active": True,
        "clicks": 0,
        "applications": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.referrals.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/")
async def list_referrals(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all referral links with stats"""
    verify_admin(authorization)
    referrals = await db.referrals.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

    # Compute per-status breakdown via aggregation
    pipeline = [
        {"$match": {"referral_slug": {"$exists": True, "$ne": ""}}},
        {"$group": {"_id": {"slug": "$referral_slug", "status": "$status"}, "count": {"$sum": 1}}},
    ]
    agg = await db.applications.aggregate(pipeline).to_list(1000)

    breakdown = {}
    for row in agg:
        slug = row["_id"]["slug"]
        status = row["_id"]["status"] or "Neu"
        breakdown.setdefault(slug, {})[status] = row["count"]

    for r in referrals:
        r["status_breakdown"] = breakdown.get(r["slug"], {})

    return referrals


@router.delete("/{referral_id}")
async def delete_referral(
    referral_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a referral link"""
    verify_admin(authorization)
    result = await db.referrals.delete_one({"id": referral_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Referral nicht gefunden")
    return {"message": "Referral gelöscht"}


@router.patch("/{referral_id}/toggle")
async def toggle_referral(
    referral_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Activate / deactivate a referral link"""
    verify_admin(authorization)
    ref = await db.referrals.find_one({"id": referral_id}, {"_id": 0})
    if not ref:
        raise HTTPException(status_code=404, detail="Referral nicht gefunden")
    new_state = not ref.get("active", True)
    await db.referrals.update_one({"id": referral_id}, {"$set": {"active": new_state}})
    return {"active": new_state}


# ============ PUBLIC ENDPOINTS ============

@router.get("/track/{slug}")
async def track_click(
    slug: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Public: Increment click counter for a referral slug. Returns referral info."""
    slug = (slug or "").strip().lower()
    ref = await db.referrals.find_one({"slug": slug}, {"_id": 0})
    if not ref:
        return {"valid": False}
    if not ref.get("active", True):
        return {"valid": False, "inactive": True}
    await db.referrals.update_one({"slug": slug}, {"$inc": {"clicks": 1}})
    return {
        "valid": True,
        "slug": ref["slug"],
        "name": ref.get("name", ""),
    }
