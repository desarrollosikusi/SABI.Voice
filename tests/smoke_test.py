import urllib.request
import urllib.error
import sys
import json
import time

API_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def check_endpoint(url, method="GET", data=None, headers=None, expected_status=[200]):
    print(f"[{method}] {url} ... ", end="")
    req = urllib.request.Request(url, method=method)
    if data:
        req.data = data.encode('utf-8')
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
            
    try:
        response = urllib.request.urlopen(req, timeout=10)
        status = response.getcode()
        if status in expected_status:
            print(f"✅ OK ({status})")
            return True, response.read().decode('utf-8')
        else:
            print(f"❌ FALLO (Esperado {expected_status}, recibido {status})")
            return False, ""
    except urllib.error.HTTPError as e:
        if e.code in expected_status:
            print(f"✅ OK ({e.code}) - Esperado para Auth")
            return True, ""
        print(f"❌ HTTP Error {e.code}: {e.reason}")
        return False, ""
    except Exception as e:
        print(f"❌ Error de Conexión: {str(e)}")
        return False, ""

def run_suite():
    print("=========================================")
    print("   SABI VOICE - SUITE DE SMOKE TESTS")
    print("=========================================\n")
    
    passed = 0
    total = 0
    
    # 1. Frontend is up
    total += 1
    ok, _ = check_endpoint(f"{FRONTEND_URL}/login")
    if ok: passed += 1
    
    # 2. Frontend Customer is up
    total += 1
    ok, _ = check_endpoint(f"{FRONTEND_URL}/portal-cliente/login")
    if ok: passed += 1
        
    # 3. API Health
    total += 1
    ok, _ = check_endpoint(f"{API_URL}/health")
    if ok: passed += 1
        
    # 4. Login Admin API (Should reject unauthorized, meaning the endpoint exists and responds 401 instead of 500)
    total += 1
    data = "username=admin&password=wrongpassword"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    ok, _ = check_endpoint(f"{API_URL}/auth/login", method="POST", data=data, headers=headers, expected_status=[401])
    if ok: passed += 1

    # 5. Dashboard Endpoints (Check for 401 Unauthorized, meaning they exist and are protected)
    total += 1
    ok, _ = check_endpoint(f"{API_URL}/dashboard/executive-summary", expected_status=[401, 403])
    if ok: passed += 1
        
    total += 1
    ok, _ = check_endpoint(f"{API_URL}/portal/dashboard", expected_status=[401, 403])
    if ok: passed += 1

    print("\n=========================================")
    print(f" RESULTADO: {passed}/{total} Pruebas exitosas")
    print("=========================================")
    
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    time.sleep(2) # Wait for containers just in case
    run_suite()
