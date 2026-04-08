import urllib.request

urls = {
    "roti1": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80",
    "roti2": "https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?auto=format&fit=crop&w=400&q=80",
    "roti3": "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&w=400&q=80",
    "teh1": "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=400&q=80",
    "teh2": "https://images.unsplash.com/photo-1571934811356-5cc50f152d19?auto=format&fit=crop&w=400&q=80",
    "teh3": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80"
}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, method="HEAD")
        urllib.request.urlopen(req)
        print(f"SUCCESS: {name}")
    except Exception as e:
        print(f"FAILED: {name} - {e}")
