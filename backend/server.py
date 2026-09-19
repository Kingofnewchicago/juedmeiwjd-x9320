from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

# Include admin routes
from routes.admin import router as admin_router
app.include_router(admin_router)

# Include application routes
from routes.applications import router as applications_router
app.include_router(applications_router)

# Include employee routes
from routes.employee import router as employee_router
app.include_router(employee_router)

# Include contract routes
from routes.contracts import router as contracts_router
app.include_router(contracts_router)

# Include anosim routes
from routes.anosim import router as anosim_router
app.include_router(anosim_router)

# Include email inbox routes
from routes.email_inbox import router as email_inbox_router
app.include_router(email_inbox_router)

# Include quiz routes
from routes.quiz import router as quiz_router
app.include_router(quiz_router)

# Include chat routes
from routes.chat import router as chat_router
app.include_router(chat_router)

# Include test sessions routes
from routes.test_sessions import router as test_sessions_router
app.include_router(test_sessions_router)

from routes.referrals import router as referrals_router
app.include_router(referrals_router)




# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


@app.on_event("startup")
async def seed_admin():
    """Idempotently ensure the admin account matches ADMIN_EMAIL/ADMIN_PASSWORD from env.
    Migrates the legacy admin record (renames email + resets password) so the existing
    account/history is preserved and the user is never locked out."""
    from utils.auth import get_password_hash, verify_password

    new_email = os.environ.get("ADMIN_EMAIL")
    new_password = os.environ.get("ADMIN_PASSWORD")
    if not new_email or not new_password:
        logger.warning("ADMIN_EMAIL/ADMIN_PASSWORD not set - skipping admin seeding")
        return

    existing_new = await db.admins.find_one({"email": new_email})
    if existing_new:
        if not verify_password(new_password, existing_new["password_hash"]):
            await db.admins.update_one(
                {"_id": existing_new["_id"]},
                {"$set": {"password_hash": get_password_hash(new_password)}},
            )
            logger.info("Admin password updated from env")
        return

    legacy = await db.admins.find_one(
        {"email": {"$in": ["admin@prysm-technologies.com", "admin@keyperion-technologies.com", "admin@keyperion-technologies.de", "admin@precision-labs.de"]}}
    )
    if legacy:
        await db.admins.update_one(
            {"_id": legacy["_id"]},
            {"$set": {"email": new_email, "password_hash": get_password_hash(new_password)}},
        )
        logger.info("Legacy admin migrated to %s", new_email)
        return

    await db.admins.insert_one({
        "id": "admin-001",
        "email": new_email,
        "password_hash": get_password_hash(new_password),
        "name": "Administrator",
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
        "last_login": None,
    })
    logger.info("Admin account created for %s", new_email)


@app.on_event("startup")
async def sync_templates():
    """Keep contract templates in sync with the code version on every startup."""
    try:
        from routes.applications import sync_contract_templates
        await sync_contract_templates(db)
        logger.info("Contract templates synced")
    except Exception as e:
        logger.error("Contract template sync failed: %s", e)