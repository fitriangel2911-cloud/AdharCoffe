import urllib.request
urls = {
    "toast1": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80",
    "toast2": "https://images.unsplash.com/photo-1596484552834-6a58f850d0d1?auto=format&fit=crop&w=400&q=80",
    "toast3": "https://images.unsplash.com/photo-1601662916686-3023fe1894d0?auto=format&fit=crop&w=400&q=80",
    "bread1": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    "bread2": "https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?auto=format&fit=crop&w=400&q=80",
    "dessert": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80"
}
for name, url in urls.items():
    try:
        req = urllib.request.Request(url, method="HEAD")
        urllib.request.urlopen(req)
        print("OK", name)
    except:
        pass
