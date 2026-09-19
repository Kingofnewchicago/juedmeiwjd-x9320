"""One-off cleanup of TEST_sec_* artefacts created by the security audit."""
import os

from dotenv import dotenv_values
from pymongo import MongoClient

env = dotenv_values("/app/backend/.env")
client = MongoClient(env["MONGO_URL"])
db = client[env["DB_NAME"]]

print("applications:", db.applications.delete_many({"email": {"$regex": "^TEST_sec_"}}).deleted_count)
print("contracts:", db.contracts.delete_many({"employee_email": {"$regex": "^TEST_sec_"}}).deleted_count)
print("sessions:", db.test_sessions.delete_many({"title": "TEST_sec session"}).deleted_count)
print("login_attempts:", db.login_attempts.delete_many({"identifier": {"$regex": "sectest-bruteforce"}}).deleted_count)
print("audit:", db.admin_login_audit.delete_many({"email": {"$regex": "sectest-bruteforce"}}).deleted_count)
