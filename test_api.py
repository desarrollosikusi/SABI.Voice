import requests

BASE_URL = "http://localhost:8000"

def test():
    # Test Create Priority
    print("Creating Priority...")
    resp = requests.post(f"{BASE_URL}/admin/priorities", json={
        "name": "Alta",
        "color": "#FF0000",
        "horas_objetivo": 2,
        "orden": 1
    })
    print(resp.status_code, resp.text)

    # Test Create Type
    print("Creating Type...")
    resp = requests.post(f"{BASE_URL}/admin/types", json={
        "name": "Incidente"
    })
    print(resp.status_code, resp.text)

    # Test Create State
    print("Creating State...")
    resp = requests.post(f"{BASE_URL}/admin/states", json={
        "name": "Registrado",
        "is_initial": True,
        "is_final": False,
        "sla_paused": False,
        "is_active": True
    })
    print(resp.status_code, resp.text)

    # Fetch priorities
    print("Fetching Priorities...")
    resp = requests.get(f"{BASE_URL}/admin/priorities")
    print(resp.status_code, resp.text)

if __name__ == "__main__":
    test()
