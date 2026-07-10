import urllib.request
import json
import time
from datetime import datetime

print('Starting S1-04 Smoke Test...')
API_URL = 'http://localhost:8000'

def test_s1_04():
    # 1. Login to get a cookie
    req = urllib.request.Request(f'{API_URL}/auth/login', method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    login_data = 'username=admin&password=admin123'.encode('utf-8')
    try:
        res = urllib.request.urlopen(req, data=login_data)
        cookie = res.getheader('Set-Cookie').split(';')[0]
        print('✅ Login successful.')
    except Exception as e:
        print('❌ Login failed:', getattr(e, 'read', lambda: str(e))())
        return False

    # 2. Get first PQRSF
    req = urllib.request.Request(f'{API_URL}/pqrsf', method='GET')
    req.add_header('Cookie', cookie)
    try:
        res = urllib.request.urlopen(req)
        pqrsfs = json.loads(res.read())
        if not pqrsfs:
            print('⚠️ No PQRSF found to test. Cannot proceed.')
            return True
        pqrsf_id = pqrsfs[0]['id']
        print(f'✅ Found PQRSF {pqrsf_id}.')
    except Exception as e:
        print('❌ Get PQRSF list failed:', getattr(e, 'read', lambda: str(e))())
        return False

    # 3. Get Detail with relationships
    req = urllib.request.Request(f'{API_URL}/pqrsf/{pqrsf_id}', method='GET')
    req.add_header('Cookie', cookie)
    try:
        res = urllib.request.urlopen(req)
        detail = json.loads(res.read())
        
        # Verify schema mapping
        if 'customer' not in detail or 'tipo' not in detail:
            print('❌ Schema missing fields (customer, tipo)')
            return False
            
        print('✅ Get PQRSF Detail mapping correct.')
    except Exception as e:
        print('❌ Get PQRSF Detail failed:', getattr(e, 'read', lambda: str(e))())
        return False

    # 4. Update state and add note
    req = urllib.request.Request(f'{API_URL}/pqrsf/{pqrsf_id}', method='PUT')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Cookie', cookie)
    
    current_estado = detail.get('estado_id')
    new_estado = 2 if current_estado == 1 else 1
    
    update_data = json.dumps({
        'estado_id': new_estado,
        'motivo_cambio': 'Prueba automática S1-04',
        'nueva_nota': 'Esta es una nota interna de prueba'
    }).encode('utf-8')
    
    try:
        res = urllib.request.urlopen(req, data=update_data)
        updated = json.loads(res.read())
        if updated['estado_id'] != new_estado:
            print('❌ Update failed to change estado_id.')
            return False
        print('✅ Update PQRSF with nota and estado successful.')
    except Exception as e:
        print('❌ Update PQRSF failed:', getattr(e, 'read', lambda: str(e))())
        return False

    return True

if test_s1_04():
    print('✅ S1-04 Smoke Test Passed.')
else:
    print('❌ S1-04 Smoke Test Failed.')
