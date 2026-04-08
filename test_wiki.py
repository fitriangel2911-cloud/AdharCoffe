import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://upload.wikimedia.org/wikipedia/commons/e/ec/Roti_bakar_chocolate.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as r:
        print("OK", r.status)
except Exception as e:
    print("FAILED", e)

url2 = "https://upload.wikimedia.org/wikipedia/commons/c/ca/Roti_Bakar.jpg"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req2, context=ctx) as r:
        print("OK2", r.status)
except Exception as e:
    print("FAILED2", e)

url3 = "https://upload.wikimedia.org/wikipedia/commons/4/4b/Roti_Bakar_Bandung.jpg"
req3 = urllib.request.Request(url3, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req3, context=ctx) as r:
        print("OK3", r.status)
except Exception as e:
    print("FAILED3", e)
