import json

with open("static/bangs.json","r") as f:
    bangs = json.load(f)

with open("static/bangs.json","w") as f:
    json.dump(bangs,f,indent=4)