function messageListener(message, sender, sendResponse) {
    switch(message.type){
        case 'on_password':
            kph.get_logins(message.body.host, message.body.host).then((login_list) => {
                browser.tabs.sendMessage(sender.tab.id, {
                    type:"on_password_ret", 
                    body:{
                        logins: login_list
                    }
                });
            });

            console.log("Getting passwords matching: ", message.body.host);
            break;
        default:
            console.log("received: ", message);
    }
}

var ls = window.content.localStorage;
var kph = new KeepassHtml (ls);

browser.runtime.onMessage.addListener(messageListener);
