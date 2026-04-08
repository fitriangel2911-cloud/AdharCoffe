import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def DL(url, name):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        data = urllib.request.urlopen(req, context=ctx).read()
        with open("d:/AdharCoffe/AdharCoffe/public/" + name, "wb") as f:
            f.write(data)
        print("OK", name, len(data), "bytes")
    except Exception as e:
        print("FAIL", name, e)

DL("https://asset.kompas.com/crops/O3v6h5a-P4Jv_dF_e-e98F0V2rQ=/0x0:1000x667/750x500/data/photo/2021/08/12/6114b0b131804.jpg", "roti-bakar.jpg")
DL("https://asset.kompas.com/crops/g5-V3XoLEmR2pQf8e75jQJ_-wJ8=/81x54:901x601/750x500/data/photo/2022/10/26/6358c9b9195b6.jpg", "bola-ubi.jpg")
DL("https://asset.kompas.com/crops/-B8rLwO9Yg-J4mQz8G-U6vQ7bTQ=/0x0:800x533/750x500/data/photo/2022/12/05/638da0ab9148d.jpg", "teh-hijau.jpg")
