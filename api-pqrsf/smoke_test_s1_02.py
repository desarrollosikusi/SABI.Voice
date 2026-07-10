import urllib.request
import urllib.error
import urllib.parse
import json

API_URL = 'http://localhost:8000'
FRONTEND_URL = 'http://frontend:3000'

def test_login_failed():
    print('1. Login fallido...')
    req = urllib.request.Request(f'{API_URL}/auth/login', data=b'username=admin&password=wrong', method='POST')
    try:
        urllib.request.urlopen(req)
        print('❌ Failed: Should have thrown 401')
        return False
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print('✅ OK (401)')
            return True
        return False

def test_login_success():
    print('2. Login exitoso...')
    req = urllib.request.Request(f'{API_URL}/auth/login', data=b'username=admin&password=admin123', method='POST')
    try:
        res = urllib.request.urlopen(req)
        cookie = res.headers.get('Set-Cookie')
        if cookie and 'access_token=' in cookie and 'HttpOnly' in cookie:
            print('✅ OK (200, HttpOnly Cookie received)')
            return cookie.split(';')[0]
        print('❌ Failed: No HttpOnly Cookie')
        return False
    except Exception as e:
        print(f'❌ Failed: {e}')
        return False

def test_acceso_autenticado(cookie):
    print('3. Acceso autenticado...')
    req = urllib.request.Request(f'{API_URL}/users/me', method='GET')
    req.add_header('Cookie', cookie)
    try:
        urllib.request.urlopen(req)
        print('✅ OK (200)')
        return True
    except Exception as e:
        print(f'❌ Failed: {e}')
        return False

def test_acceso_sin_cookie():
    print('4. Acceso sin Cookie...')
    req = urllib.request.Request(f'{API_URL}/users/me', method='GET')
    try:
        urllib.request.urlopen(req)
        print('❌ Failed: Should have thrown 401')
        return False
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print('✅ OK (401)')
            return True
        return False

def test_cookie_alterada():
    print('5. Cookie alterada...')
    req = urllib.request.Request(f'{API_URL}/users/me', method='GET')
    req.add_header('Cookie', 'access_token=eyJh.b.c')
    try:
        urllib.request.urlopen(req)
        print('❌ Failed: Should have thrown 401')
        return False
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print('✅ OK (401)')
            return True
        return False

def test_logout(cookie):
    print('6. Logout...')
    req = urllib.request.Request(f'{API_URL}/auth/logout', method='POST')
    req.add_header('Cookie', cookie)
    try:
        res = urllib.request.urlopen(req)
        new_cookie = res.headers.get('Set-Cookie')
        if new_cookie and 'Max-Age=0' in new_cookie:
            print('✅ OK (200, Max-Age=0 received)')
            return True
        print('❌ Failed: No Max-Age=0')
        return False
    except Exception as e:
        print(f'❌ Failed: {e}')
        return False

def test_ssr_redirect():
    print('7. Redirección SSR...')
    req = urllib.request.Request(f'{FRONTEND_URL}/dashboard', method='GET')
    try:
        res = urllib.request.urlopen(req)
        # Without cookie, it should redirect to /login
        url = res.geturl()
        if '/login' in url:
            print('✅ OK (Redirected to /login)')
            return True
        print(f'❌ Failed: Redirected to {url}')
        return False
    except Exception as e:
        print(f'❌ Failed: {e}')
        return False

if __name__ == '__main__':
    t1 = test_login_failed()
    cookie = test_login_success()
    t3 = test_acceso_autenticado(cookie) if cookie else False
    t4 = test_acceso_sin_cookie()
    t5 = test_cookie_alterada()
    t6 = test_logout(cookie) if cookie else False
    t7 = test_ssr_redirect()
    
    if all([t1, cookie, t3, t4, t5, t6, t7]):
        print('\n🚀 ALL TESTS PASSED')
    else:
        print('\n❌ SOME TESTS FAILED')
        exit(1)
