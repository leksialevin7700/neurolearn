
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def check_health():
    print("Checking health...")
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
        print(f"Health Status: {response.json()}")
        return response.json().get("adk_enabled", False)
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def verify_adk():
    print("\nVerifying ADK Content Generation...")
    payload = {
        "user_id": "test_user_999",
        "domain": "dsa",
        "topic": "Binary Search Trees",
        "skill_level": "intermediate",
        "format_preference": "text",
        "weak_concepts": ["balancing", "rotation"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/learning/generate", json=payload)
        
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            print(response.text)
            return
            
        data = response.json()
        module = data.get("module", {})
        title = module.get("title", "")
        tldr = module.get("tldr", "")
        
        print(f"Title: {title}")
        print(f"TL;DR: {tldr[:100]}...")
        
        # Check if it's mock content
        mock_title = "Mastering Binary Search Trees"
        mock_tldr_start = "A comprehensive guide to understanding Binary Search Trees"
        
        if title == mock_title and tldr.startswith(mock_tldr_start):
            print("\nVerification Failed: Received MOCK content. ADK is not generating real content.")
            print("Check if GEMINI_API_KEY is valid and ADK_ENABLED is True in .env")
        else:
            print("\nVerification Successful: Received GENERATED content from ADK!")
            
    except Exception as e:
        print(f"Verification request failed: {e}")

if __name__ == "__main__":
    if not check_health():
        print("Backend is not running correctly or ADK is disabled. Please start the backend first.")
        sys.exit(1)
        
    verify_adk()
