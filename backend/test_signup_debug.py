import requests
import json

API_URL = "http://localhost:8000/api/v1/auth/signup"

payload = {
    "email": "testuser@example.com",
    "password": "password123",
    "full_name": "Test User"
}

try:
    response = requests.post(API_URL, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
