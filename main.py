from sanic import *
from sanic_ext import render

app = Sanic(__name__)

app.static("/static","./static")


@app.route('/')
async def index(request:Request):
    return await render("index.html")

@app.route("/search")
async def search(request:Request):
    return await render("search.html")


if __name__ == "__main__":
    app.run("0.0.0.0",2007,dev=True)