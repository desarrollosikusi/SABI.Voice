import requests

BASE_URL = 'http://localhost:8000'

def test_login():
    print('Testing Login...')
    res = requests.post(f'{BASE_URL}/auth/login', data={'username': 'admin', 'password': 'adminpassword'})
    if res.status_code == 401:
        res = requests.post(f'{BASE_URL}/auth/login', data={'username': 'admin', 'password': 'admin123'})
        
    assert res.status_code == 200, f'Login failed: {res.text}'
    
    cookies = res.cookies
    assert 'access_token' in cookies, 'Cookie access_token not found!'
    print('✅ Cookie Set successfully!')
    
    token = res.json()['access_token']
    
    print('Testing Auth via Cookie only...')
    res_cookie = requests.get(f'{BASE_URL}/users/me', cookies=cookies)
    assert res_cookie.status_code == 200, f'Cookie auth failed: {res_cookie.text}'
    print('✅ Cookie Auth successful!')
    
    print('Testing Auth via Header only...')
    res_header = requests.get(f'{BASE_URL}/users/me', headers={'Authorization': f'Bearer {token}'})
    assert res_header.status_code == 200, f'Header auth failed: {res_header.text}'
    print('✅ Header Auth successful!')

    print('Testing Logout...')
    res_logout = requests.post(f'{BASE_URL}/auth/logout')
    assert res_logout.status_code == 200, 'Logout failed'
    print('✅ Logout Set-Cookie successful!')

if __name__ == '__main__':
    test_login()
    print('ALL TESTS PASSED')
