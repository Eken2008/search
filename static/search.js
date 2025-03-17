const searchWithBang = (query, bang) => {
    query = query.trim();
    const _search = (url, query) => {
        // If the user searches from the address bar, don't add / to the history
        if (window.location.hash.includes("#query=") && window.location.hash!=="#query=!ose"){
            window.location.replace(url.replace("{{{s}}}", query));
        }
        else{
            window.location.href = url.replace("{{{s}}}", query);
        }
    }

    for (const element of bangs){
        if (element.t===bang) {
            // Go to full url if there is no placeholder for query
            if (!element.u.includes("{{{s}}}")){
                _search(element.u, query);
                return;
            }
            // If query is empty, go to main page of the site
            if (query.length===0){
                if (element.d){
                    _search("https://"+element.d, query);
                }
                // If there is no main page specified, go to / of the site
                else{
                    _search("https://"+(element.u.split("/")[2]), query);
                }
                return;
            }
            // If there is a placeholder for query and query is not empty, go to the url with the query
            _search(element.u, query);
            return;
        }
    }
    // If no bang is found, search with the default bang
    searchWithBang("!"+bang+query, getDefaultBang());
}


const search = (query) => {
    const expr = RegExp(/![A-z0-9]+/);

    const match = query.match(expr);

    if (match) {
        const bang = match[0].replace('!', '');
        query = query.replace(match[0], '');

        // Remove all + (whitespace) from the beginning of the query
        while (query.startsWith("+")){
            query = query.replace("+", "");
        }

        searchWithBang(query, bang);
    }
    else{
        searchWithBang(query, getDefaultBang());
    }
}

const onloadSearch = () => {
    if (window.location.hash.includes("#query=")){
        const query = decodeURI(window.location.hash.replace("#query=", ""));
        if (query.trim()!=="!ose"){
            search(query);
        }
    }
}




// Bangs
const getDefaultBang = () => {
    return localStorage.getItem("defaultBang");
}

// Initialize local storage
if (!localStorage.getItem("defaultBang")){
    localStorage.setItem("defaultBang", "ddg");
}
if (localStorage.getItem("localBangs")===null){
    localStorage.setItem("localBangs", JSON.stringify([]));
}

let bangs = null;
const loadBangs = () => {
    bangs = JSON.parse(localStorage.getItem("localBangs")).concat(JSON.parse(localStorage.getItem("bangs")));
}

if (localStorage.getItem("bangs")===null){
    // If there are no bangs in the local storage, fetch them from the server and search
    fetch("/static/bangs.json")
        .then(resp=>resp.json())
        .then(bangs=>{
            localStorage.setItem("bangs", JSON.stringify(bangs));
            loadBangs();
            onloadSearch();
        });
}
else{
    // If there are bangs in the local storage, load them and search
    loadBangs();
    onloadSearch();
}


window.onload = () => {
    document.querySelector("form").addEventListener("submit",(e)=>{
        e.preventDefault();
        search(document.querySelector("input[name='query']").value);
    })
}

window.onhashchange = () => {
    onloadSearch();
}