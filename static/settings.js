const createBangGroup = (bang) => {
    // Create a group for bang
    const group = document.createElement("div");
    group.classList.add("settingsBangGroup");

    // Input for bang name
    const inputBang = document.createElement("input");
    inputBang.classList.add("settingsBang");
    inputBang.disabled=true;
    inputBang.value = bang.t;
    group.appendChild(inputBang);

    // Input for bang URL
    const inputUrl = document.createElement("input");
    inputUrl.classList.add("settingsUrl");
    inputUrl.value = bang.u.replace("{{{s}}}", "%s").replace("https://","");
    inputUrl.disabled=true;
    group.appendChild(inputUrl);

    // Button to remove bang
    const removeButton = document.createElement("button");
    removeButton.innerHTML="-";
    removeButton.classList.add("settingsBangButton");
    removeButton.onclick = () => {
        // Get the URL and bang name to remove
        const url = removeButton.parentElement.querySelector(".settingsUrl").value;
        const bang = removeButton.parentElement.firstElementChild.value;

        const localBangs = JSON.parse(localStorage.getItem("localBangs"));
        for(const storedBang of localBangs){
            if (storedBang.u.replace("https://","")===url.replace("%s","{{{s}}}")&&storedBang.t===bang){
                // Remove bang that matches the URL and name and reopen settings
                localBangs.splice(localBangs.indexOf(storedBang),1);
                localStorage.setItem("localBangs", JSON.stringify(localBangs));
                loadBangs();
                removeButton.parentElement.remove();
                break;
            }
        }
    }
    group.appendChild(removeButton);
    
    return group;
}

const openSettings = () => {
    // Reset input fields
    document.querySelector(".customBangs").innerHTML="";
    document.querySelector(".defaultBangInput").value=getDefaultBang();
    for (const bang of JSON.parse(localStorage.getItem("localBangs"))) {
        const group = createBangGroup(bang);

        document.querySelector(".customBangs").appendChild(group);
    }

    // Show settings
    document.querySelector(".settingsBg").style.opacity="0";
    document.querySelector(".settingsBg").style.display="flex";
    requestAnimationFrame(()=>
        requestAnimationFrame(()=>
            document.querySelector(".settingsBg").style.opacity="1"
        )
    );
}

const closeSettings = () => {
    // Hide settings
    document.querySelector(".settingsBg").style.opacity="0";
    setTimeout(() => {
        document.querySelector(".settingsBg").style.display="none";
    }, 100);
}


window.addEventListener("load", () => {
    document.querySelector(".settingsButton").onclick = openSettings;

    document.querySelector(".settingsBg").onclick = (e) => {
        // Close settings if clicked outside
        if (!document.querySelector(".settings").matches(":hover")){
            closeSettings();
        }
    }
    document.querySelector(".closeButton").onclick = () => {
        closeSettings();
    }


    document.querySelector(".defaultBangInput").onkeydown = (e) => {
        localStorage.setItem("defaultBang", e.target.value);
    }

    // Add new bang
    document.querySelector(".settingsBangButton").onclick=(e)=>{
        let bang = e.target.parentElement.firstElementChild.value;
        let url = e.target.parentElement.querySelector(".settingsUrl").value.replace("%s", "{{{s}}}");
        
        // Bang and URL must not be empty
        if (bang===""||url===""){
            return;
        }
        
        // Add https:// to URL if not present
        if (!(url.startsWith("http://")||url.startsWith("https://"))){
            url="https://"+url;
        }

        // Remove ! from bang if present
        if (bang.startsWith("!")){
            bang=bang.replace("!","");
        }

        const localBangs = JSON.parse(localStorage.getItem("localBangs"));

        // Add new bang first in the list
        localBangs.unshift({t:bang,u:url});
        localStorage.setItem("localBangs", JSON.stringify(localBangs));

        // Clear input fields and reload settings
        e.target.parentElement.firstElementChild.value="";
        e.target.parentElement.querySelector(".settingsUrl").value="";
        
        const group = createBangGroup({t:bang,u:url});
        document.querySelector(".customBangs").prepend(group);

        loadBangs();
    }        
});


window.addEventListener("keydown", (e) => {
    if (e.key==="Escape"){
        closeSettings();
    }
});