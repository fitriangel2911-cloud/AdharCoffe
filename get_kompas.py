import urllib.request
url = "https://asset.kompas.com/crops/O3v6h5a-P4Jv_dF_e-e98F0V2rQ=/0x0:1000x667/750x500/data/photo/2021/08/12/6114b0b131804.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as r:
        print("OK", r.status)
        with open("d:/AdharCoffe/AdharCoffe/public/roti-bakar-bandung-coklat.jpg", "wb") as f:
            f.write(r.read())
except Exception as e:
    print("FAILED", e)
