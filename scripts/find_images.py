import urllib.request
import urllib.parse
import json

def find_best(query, limit=5):
    params = urllib.parse.urlencode({
        'action': 'query',
        'generator': 'search',
        'gsrsearch': query,
        'gsrnamespace': 6,
        'gsrlimit': limit,
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime',
        'iiurlwidth': 1600,
        'format': 'json'
    })
    url = f'https://commons.wikimedia.org/w/api.php?{params}'
    req = urllib.request.Request(url, headers={'User-Agent': 'MSBPharmaApp/1.0 (contact@msbpharmachem.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            print(f'=== Results for: {query} ===')
            for pid, page in pages.items():
                info = page.get('imageinfo', [{}])[0]
                thumb = info.get('thumburl', info.get('url'))
                mime = info.get('mime', '')
                w = info.get('width', 0)
                h = info.get('height', 0)
                if 'image' in mime and w > 800:
                    title = page.get('title', '')
                    print(f"{title} ({w}x{h})\n  URL: {thumb}\n")
    except Exception as e:
        print(f"Error for {query}: {e}")

if __name__ == '__main__':
    queries = [
        'pharmaceutical manufacturing cleanroom',
        'refrigerated truck logistics delivery',
        'cargo aircraft loading freight',
        'container terminal cargo ship port',
        'modern logistics warehouse pallets racking',
        'chemical synthesis distillation reactor',
        'spectrophotometer laboratory chemistry',
        'quality control inspection certificate document',
        'scanning electron microscope crystal',
        'Hyderabad tech park Cyberabad skyline'
    ]
    for q in queries:
        find_best(q, 3)

