import requests
import json
import time

print("Testing Ollama with minimal request...")
start_time = time.time()

try:
    # Super simple request
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "tinyllama", "prompt": "Say hello"},
        timeout=10
    )
    
    duration = time.time() - start_time
    
    print(f"Response received in {duration:.2f} seconds")
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Response content:")
        print(json.dumps(data, indent=2))
    else:
        print(f"Error response: {response.text}")
        
except Exception as e:
    print(f"Error: {str(e)}")