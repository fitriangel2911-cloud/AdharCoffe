import asyncio
from backend.database import get_supabase
import uuid

async def test_roles():
    sb = get_supabase()
    roles_to_test = ['Admin', 'admin', 'Kasir', 'kasir', 'Pelanggan', 'pelanggan', 'Dapur', 'dapur', 'Staff', 'staff', 'Staff Dapur', 'staff_dapur', 'Koki', 'koki', 'Barista', 'barista']
    
    with open("roles_result.txt", "w", encoding="utf-8") as f:
        for role in roles_to_test:
            test_email = f"test_{uuid.uuid4()}@example.com"
            try:
                res = sb.table("users").insert({
                    "nama": "Test User",
                    "email": test_email,
                    "password": "password",
                    "role": role
                }).execute()
                f.write(f"SUCCESS: Role '{role}' is valid!\n")
                # cleanup
                sb.table("users").delete().eq("email", test_email).execute()
            except Exception as e:
                err = str(e)
                if "invalid input value for enum" in err:
                    f.write(f"FAILED (Enum Error): Role '{role}'\n")
                else:
                    f.write(f"FAILED (Other): Role '{role}' - {err}\n")

if __name__ == "__main__":
    asyncio.run(test_roles())
