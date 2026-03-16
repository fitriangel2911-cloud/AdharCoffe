import json
import urllib.request
import urllib.parse

url = 'http://127.0.0.1:8001/api/checkout'
data = [
    {
        "kuantitas_menu": 5, 
        "hpp": 5000, 
        "harga": 15000, 
        "nama_pembeli": "Test Bug", 
        "no_meja": "1", 
        "metode_pembayaran": "Tunai", 
        "kontak": "", 
        "tipe_pesanan": "Makan Ditempat", 
        "infaq": 0
    }
]

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = response.read()
        print(f"STATUS: {response.status}")
        print(f"RESPONSE JSON: {result.decode('utf-8')}")
except Exception as e:
    print(f"ERROR: {e}")
