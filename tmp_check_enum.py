import asyncio
from backend.database import get_supabase

async def check_enum():
    sb = get_supabase()
    # Supabase Python client doesn't support direct arbitrary SQL execution easily
    # But we can try to fetch the schema using PostgREST if it exposes it, or we can just try to insert different roles to see what fails
    # Or better yet, we can execute a raw SQL query if we have the postgres connection string, but we only have sb client.

    # Let's try to query the users table and see what roles exist.
    res = sb.table("users").select("role").execute()
    roles = set()
    for row in res.data:
        roles.add(row.get("role"))
    print("Roles found in users table:", roles)

if __name__ == "__main__":
    asyncio.run(check_enum())
