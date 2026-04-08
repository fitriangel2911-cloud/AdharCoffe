import urllib.request, json
data = json.loads(urllib.request.urlopen('http://127.0.0.1:8001/api/menu').read())
for item in data:
    print(f"ID={item['id']} NAME={item['nama_menu']}")
