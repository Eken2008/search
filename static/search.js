const search = (query,replace) => {
    const _search = (url,query) => {
        if(replace){
            window.location.replace(url.replace("{{{s}}}", encodeURI(query)))
        }
        else{
            window.location.href = url.replace("{{{s}}}", encodeURI(query))
        }
    }

    let expr=RegExp(/![A-z0-9]+/);

    let match = query.match(expr);

    if (match) {
        let command = match[0].replace('!', '');
        query = query.replace(match[0], '');

        while (query.startsWith("+")){
            query=query.replace("+","");
        }
        
        bangs.forEach(element => {
            if (element.t===command) {
                _search(element.u, query);
            }
        });
    }
    else{
        _search("https://duckduckgo.com/?q={{{s}}}", query);
    }

}

let bangs = null;
if (localStorage.getItem("localBangs")===null){
    localStorage.setItem("localBangs", JSON.stringify([]));
}
const loadBangs = () => {
    bangs = JSON.parse(localStorage.getItem("localBangs")).concat(JSON.parse(localStorage.getItem("bangs")));
}

const onloadSearch = () => {
    if (window.location.hash.includes("#query=")){
        search(decodeURI(window.location.hash).replace('#query=', ''),true)
    }
}

loadBangs();
if (localStorage.getItem("bangs")===null){
    fetch("/static/bangs.json").then(resp=>resp.json()).then(resp=>{
        localStorage.setItem("bangs", JSON.stringify(resp));
        loadBangs();
        onloadSearch();
    })
}
else{
    onloadSearch();
}




window.onload = () => {
    document.querySelector("form").onsubmit=(e)=>{
        search(e.target.querySelector("input[name='query']").value);
    }
}