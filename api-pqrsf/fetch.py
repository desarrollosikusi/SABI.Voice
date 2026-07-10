import urllib.request
import json
req = urllib.request.Request('http://localhost:8000/pqrsf', method='GET')
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    if len(data) > 0:
        print(json.dumps(data[0], indent=2))
    else:
        print('Empty')
except Exception as e:
    print(e)
