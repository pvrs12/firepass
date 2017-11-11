function messageListener(message){
    switch(message.type){
        case("on_password_ret"):
            //TODO show a popup asking if they want to copy the password or anything
            console.log(message.body.logins);
            break;
        default:
            console.log("script received:", message);
    }
}

let input_elements = document.getElementsByTagName("input");
for(let i=0; i<input_elements.length;++i){
    let element = input_elements[i];
    let attribute = element.getAttribute("type");
    if(attribute === null || attribute == ""){
        continue;
    }
    if(attribute === "password"){
        //found a password input
        let sent_message = browser.runtime.sendMessage({
            type: "on_password",
            body: {
                host: window.location.host
            }
        });
    }
}

browser.runtime.onMessage.addListener(messageListener);