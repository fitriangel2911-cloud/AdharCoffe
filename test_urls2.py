import urllib.request

urls = {
    "choc_toast": "https://images.unsplash.com/photo-1601662916686-3023fe1894d0?auto=format&fit=crop&w=400&q=80",
    "indo_toast": "https://images.unsplash.com/photo-1548485295-8e8e7a68e833?auto=format&fit=crop&w=400&q=80",
    "green_tea_1": "https://images.unsplash.com/photo-1627845347321-df626c921350?auto=format&fit=crop&w=400&q=80",
    "green_tea_2": "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=400&q=80",
    "green_tea_3": "https://images.unsplash.com/photo-1607548849767-425ee965920c?auto=format&fit=crop&w=400&q=80"
}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, method="HEAD")
        urllib.request.urlopen(req)
        print(f"OK {name}")
    except Exception as e:
        print(f"FAIL {name}: {e}")
