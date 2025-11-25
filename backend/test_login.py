import requests
import sys

API_URL = "http://localhost:8000/api/v1"

def test_login():
    login_data = {
        "username": "test_debug@example.com",
        "password": "password123"
    }
    
    print(f"Attempting to login with: {login_data['username']}")
    
    try:
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        
        if response.status_code == 200:
            print("✅ Login successful!")
            token_data = response.json()
            print(f"Token received: {token_data.get('access_token')[:20]}...")
            return True
        else:
            print(f"❌ Login failed. Status: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

if __name__ == "__main__":
    success = test_login()
    if not success:
        sys.exit(1)
