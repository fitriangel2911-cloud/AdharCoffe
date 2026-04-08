import urllib.request
import re

req = urllib.request.Request("https://html.duckduckgo.com/html/?q=roti+bakar+bandung+coklat", headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Search for image links in the page
urls = re.findall(r'//external-content\.duckduckgo\.com/iu/\?u=([^&]+)', html)
for i, url in enumerate(urls[:5]):
    import urllib.parse
    print(urllib.parse.unquote(url))
