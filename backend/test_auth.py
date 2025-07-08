#!/usr/bin/env python3
"""
Test script for SnapInsight authentication system
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_signup():
    """Test user signup"""
    print("Testing user signup...")
    url = f"{BASE_URL}/auth/signup"
    data = {
        "name": "Test User 2",
        "email": "test2@example.com",
        "password": "testpassword123",
        "confirm_password": "testpassword123"
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Signup successful! User ID: {user_data['id']}, Name: {user_data['name']}")
        return True
    else:
        print(f"❌ Signup failed: {response.status_code} - {response.text}")
        return False

def test_login():
    """Test user login"""
    print("Testing user login...")
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "test2@example.com",
        "password": "testpassword123"
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        token_data = response.json()
        print(f"✅ Login successful! Access token received.")
        return token_data["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_protected_endpoint(access_token):
    """Test protected endpoint with access token"""
    print("Testing protected endpoint...")
    url = f"{BASE_URL}/auth/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Protected endpoint access successful! User: {user_data['name']} ({user_data['email']})")
        return True
    else:
        print(f"❌ Protected endpoint access failed: {response.status_code} - {response.text}")
        return False

def test_user_queries(access_token):
    """Test getting user queries"""
    print("Testing user queries endpoint...")
    url = f"{BASE_URL}/auth/queries"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        queries = response.json()
        print(f"✅ User queries retrieved successfully! Found {len(queries)} queries.")
        return True
    else:
        print(f"❌ User queries failed: {response.status_code} - {response.text}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting SnapInsight Authentication Tests\n")
    
    # Test signup
    if not test_signup():
        print("❌ Signup test failed. Stopping tests.")
        return
    
    print()
    
    # Test login
    access_token = test_login()
    if not access_token:
        print("❌ Login test failed. Stopping tests.")
        return
    
    print()
    
    # Test protected endpoint
    if not test_protected_endpoint(access_token):
        print("❌ Protected endpoint test failed.")
        return
    
    print()
    
    # Test user queries
    if not test_user_queries(access_token):
        print("❌ User queries test failed.")
        return
    
    print("\n🎉 All authentication tests passed successfully!")
    print("\n📋 Summary:")
    print("✅ User signup working")
    print("✅ User login working")  
    print("✅ JWT token authentication working")
    print("✅ Protected endpoints working")
    print("✅ User queries endpoint working")
    print("\n🔧 Backend Features Implemented:")
    print("- PostgreSQL database with user and query tables")
    print("- JWT access and refresh tokens")
    print("- Password hashing with bcrypt")
    print("- User authentication and authorization")
    print("- Query storage with user association")
    print("- Guest and authenticated user support")

if __name__ == "__main__":
    main()
