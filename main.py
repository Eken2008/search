from sanic import *
from sanic_ext import render
from dotenv import load_dotenv
import os

load_dotenv()


app = Sanic(__name__)

app.static("/static","./static")

@app.middleware('response')
def set_service_worker_header(request, response):
    response.headers['Service-Worker-Allowed'] = '/'


@app.route('/')
async def index(request:Request):
    return await render("index.html")

@app.route("/search")
async def search(request:Request):
    with open("templates/search.html","r") as f:
        searchTemplate = f.read()
    with open("static/search.js","r") as f:
        searchScript = f.read()
    with open("static/main.js","r") as f:
        mainScript = f.read()
    return html(searchTemplate.replace("{{searchScript}}",searchScript).replace("{{mainScript}}",mainScript).replace("{{query}}",request.args.get("q","")))

@app.route("/calculator")
async def calculator(request:Request):
    return await render("calculator.html")

if __name__ == "__main__":
    app.run("0.0.0.0",int(os.environ["PORT"]),dev=os.environ["PROD"].lower()=="false")