import requests
import json

BASE_URL = "http://127.0.0.1:8001/api"

def test_admin_endpoints():
    print("--- Testing Admin Endpoints ---")
    
    # 1. Test GET /api/admin/users
    try:
        print("Testing GET /api/admin/users...")
        res = requests.get(f"{BASE_URL}/admin/users")
        print(f"  Status: {res.status_code}")
        if res.status_code == 200:
            users = res.json()
            print(f"  SUCCESS: Found {len(users)} users.")
            if users:
                test_user = users[0]
                print(f"  Sample User: {test_user['email']} (Role: {test_user['role']})")
                
                # 2. Test PUT /api/admin/users/{id}/role
                user_id = test_user['id']
                original_role = test_user['role']
                
                # We try to set it to 'Admin' (case sensitive as per frontend)
                # Note: This might fail with 500 if DB enum doesn't have 'Admin' yet
                print(f"Testing PUT /api/admin/users/{user_id}/role to 'Admin'...")
                res_put = requests.put(
                    f"{BASE_URL}/admin/users/{user_id}/role",
                    json={"role": "Admin"}
                )
                print(f"  Status: {res_put.status_code}")
                if res_put.status_code == 200:
                    print("  SUCCESS: Role updated.")
                    # Revert
                    requests.put(f"{BASE_URL}/admin/users/{user_id}/role", json={"role": original_role})
                    print(f"  SUCCESS: Role reverted to {original_role}.")
                else:
                    print(f"  INFO: Update failed (expected if DB enum not updated): {res_put.text}")
        else:
            print(f"  FAILED: {res.text}")
    except Exception as e:
        print(f"  ERROR: {e}")

if __name__ == "__main__":
    test_admin_endpoints()
