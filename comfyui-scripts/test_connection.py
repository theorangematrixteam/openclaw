import urllib.request
import json

req = urllib.request.Request("http://127.0.0.1:8000/system_stats")
with urllib.request.urlopen(req, timeout=5) as resp:
    print(json.loads(resp.read()))