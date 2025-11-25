import requests
import sys

API_URL = "http://localhost:8000/api/v1"

def create_user():
    user_data = {
        "email": "test_debug@example.com",
        "password": "password123",
        "full_name": "Debug User"
    }
    
    print(f"Attempting to create user: {user_data['email']}")
    
    try:
        response = requests.post(f"{API_URL}/auth/signup", json=user_data)
        
        if response.status_code == 201:
            print("✅ User created successfully!")
            print(response.json())
            return True
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("⚠️ User already exists. Proceeding with existing user.")
            return True
        else:
            print(f"❌ Failed to create user. Status: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

if __name__ == "__main__":
    success = create_user()
    if not success:
        sys.exit(1)
