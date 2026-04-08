import urllib.request, json
url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=roti%20bakar&gsrlimit=3&prop=imageinfo&iiprop=url&format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        pages = data.get('query', {}).get('pages', {})
        for page_id, page in pages.items():
            print(page.get('title'), "->", page['imageinfo'][0]['url'])
except Exception as e:
    print("Error:", e)
    
url2 = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=green%20tea%20glass&gsrlimit=3&prop=imageinfo&iiprop=url&format=json"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req2) as response:
        data = json.loads(response.read())
        pages = data.get('query', {}).get('pages', {})
        for page_id, page in pages.items():
            print(page.get('title'), "->", page['imageinfo'][0]['url'])
except Exception as e:
    print("Error:", e)
