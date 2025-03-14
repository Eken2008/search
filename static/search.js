const searchWithBang = (query,bang) => {
    const _search = (url,query) => {
        if(window.location.hash.includes("#query=")){
            window.location.replace(url.replace("{{{s}}}", encodeURI(query)))
        }
        else{
            window.location.href = url.replace("{{{s}}}", encodeURI(query))
        }
    }

    bangs.forEach(element => {
        if (element.t===bang) {
            _search(element.u, query);
        }
    });
}

const search = (query) => {

    let expr=RegExp(/![A-z0-9]+/);

    let match = query.match(expr);

    if (match) {
        let bang = match[0].replace('!', '');
        query = query.replace(match[0], '');

        while (query.startsWith("+")){
            query=query.replace("+","");
        }
        
        searchWithBang(query,bang);
    }
    else{
        searchWithBang(query,getDefaultBang());
    }

}

const getDefaultBang = () => {
    return localStorage.getItem("defaultBang");
}

if (!localStorage.getItem("defaultBang")){
    localStorage.setItem("defaultBang", "ddg");
}

let bangs = null;
if (localStorage.getItem("localBangs")===null){
    localStorage.setItem("localBangs", JSON.stringify([]));
}
const loadBangs = () => {
    bangs = JSON.parse(localStorage.getItem("bangs")).concat(JSON.parse(localStorage.getItem("localBangs")));
}

const onloadSearch = () => {
    if (window.location.hash.includes("#query=")){
        const query = decodeURI(window.location.hash).replace('#query=', '')
        if (query.trim()!=="!ose"){
            search(query,true)
        }
    }
}

if (localStorage.getItem("bangs")===null){
    fetch("/static/bangs.json").then(resp=>resp.json()).then(resp=>{
        console.log( JSON.stringify(resp))
        localStorage.setItem("bangs", JSON.stringify(resp));
        loadBangs();
        onloadSearch();
    })
}
else{
    loadBangs();
    onloadSearch();
}


const openSettings = () => {
    document.querySelector(".customBangs").innerHTML="";
    document.querySelector(".defaultBangInput").value=getDefaultBang();
    for (const bang of JSON.parse(localStorage.getItem("localBangs"))) {

        const group = document.createElement("div");
        group.classList.add("settingsBangGroup");

        const inputBang = document.createElement("input");
        inputBang.classList.add("settingsBang");
        inputBang.disabled=true;
        inputBang.value = bang.t;
        group.appendChild(inputBang);
        const inputUrl = document.createElement("input");
        inputUrl.classList.add("settingsUrl");
        inputUrl.value = bang.u.replace("{{{s}}}", "%s").replace("https://","");
        inputUrl.disabled=true;
        group.appendChild(inputUrl);
        const removeButton = document.createElement("button");
        removeButton.innerHTML="-";
        removeButton.classList.add("settingsBangButton");
        group.appendChild(removeButton);
        removeButton.onclick = () => {
            const url = removeButton.parentElement.querySelector(".settingsUrl").value;
            const bang = removeButton.parentElement.firstElementChild.value;

            const localBangs = JSON.parse(localStorage.getItem("localBangs"));
            for(const storedBang of localBangs){
                if (storedBang.u.replace("https://","")===url&&storedBang.t===bang){
                    console.log("aa",localBangs.indexOf(storedBang))
                    localBangs.splice(localBangs.indexOf(storedBang),1);
                    localStorage.setItem("localBangs", JSON.stringify(localBangs));
                    openSettings();
                    return;
                }
            }
        }
        document.querySelector(".customBangs").appendChild(group);
    }
    document.querySelector(".settingsBg").style.display="flex";
}


window.onload = () => {
    document.querySelector("form").onsubmit=(e)=>{
        search(e.target.querySelector("input[name='query']").value);
    }

    document.querySelector(".settingsButton").onclick=openSettings;

    document.querySelector(".settingsBangButton").onclick=(e)=>{
        let bang = e.target.parentElement.firstElementChild.value;
        let url = e.target.parentElement.querySelector(".settingsUrl").value.replace("%s", "{{{s}}}");
        if (bang===""||url===""){
            return;
        }
        if (!(url.startsWith("http://")||url.startsWith("https://"))){
            url="https://"+url;
        }
        if (bang.startsWith("!")){
            bang=bang.replace("!","");
        }
        const localBangs = JSON.parse(localStorage.getItem("localBangs"));
        localBangs.unshift({t:bang,u:url});
        localStorage.setItem("localBangs", JSON.stringify(localBangs));
        e.target.parentElement.firstElementChild.value="";
        e.target.parentElement.querySelector(".settingsUrl").value="";
        openSettings();
    }

    document.querySelector(".defaultBangInput").onkeydown = (e) => {
        localStorage.setItem("defaultBang", e.target.value);

    }
}

window.onkeydown = (e) => {
    if (e.key==="Escape"){
        document.querySelector(".settingsBg").style.display="none";
    }
}

window.onhashchange = (e) => {
    onloadSearch();
}