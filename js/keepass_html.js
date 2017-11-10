const ALGO = {
    name: "AES-CBC",
    length: 256
}

class KeepassHtml {
    static _arrayBufferToBase64( buffer ) {
        let binary = '';
        let bytes = new Uint8Array( buffer );
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }

    static  _base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async _get_key_from_raw(raw_key) {
        raw_key = KeepassHtml._base64ToArrayBuffer(raw_key);
        return await crypto.subtle.importKey(
            "raw",
            raw_key,
            ALGO,
            true,
            ["encrypt", "decrypt"]
        );
    }

    async _send_request(body) {
        let json_body = JSON.stringify(body);

        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open("POST", this.ls.getItem("ConnectorUrl"), false);
            request.setRequestHeader("Content-Type", "application/json");

            request.onload = () => resolve(request.responseText);
            request.onerror = () => resolve(request.statusText);
    
            request.send(json_body);
        });
    }

    async _encrypt_with_key(alg, key, message){
        return KeepassHtml._arrayBufferToBase64(
            await crypto.subtle.encrypt(
                alg, 
                key, 
                new TextEncoder("utf-8").encode(message)
            )
        );
    }

    async encrypted_request(type, key, extra_fields, extra_fields_to_encrypt) {
        let nonce = crypto.getRandomValues(new Uint8Array(16));
        let message = KeepassHtml._arrayBufferToBase64(nonce);
        
        let alg = {
            iv: nonce
        };
        Object.assign(alg, ALGO); 

        let verifier = await this._encrypt_with_key(alg, key, message);

        let base_body = {
            RequestType: type,
            Nonce: message,
            Verifier: verifier
        };

        let encrypted_extra_fields = {};

        for (var field in extra_fields_encrypted) {
            if (extra_fields_encrypted.hasOwnProperty(field)) {
                let value = extra_fields_encrypted[field];
                let enc_value = await this._encrypt_with_key(alg, key, value);
                encrypted_extra_fields[field] = enc_value;
            }
        }

        let body = Object.assign({}, base_body, extra_fields, encrypted_extra_fields);

        return JSON.parse(await this._send_request(body));
    }

    async associate (key) {
        return await this.encrypted_request("associate", key.crypto, {
            Key: key.raw
        }, {});
    }

    async test_associate() {
        return await this.encrypted_request("test-associate", this.AESKey, {
            Id: this.ls.getItem("KeyID")
        }, {});
    }

    async _get_logins(url, submit_url){
        return await this.encrypted_request("get-logins", this.AESKey, {
            Id: this.ls.getItem("KeyID"),
        }, {
            Url: url,
            SubmitUrl: submit_url
        });
    }

    async _generate_key () {
        let key = await crypto.subtle.generateKey(ALGO, true, ["encrypt", "decrypt"]);
        return {
            raw: KeepassHtml._arrayBufferToBase64(await crypto.subtle.exportKey("raw", key)), 
            crypto: key
        };
    }

    generate_new_key () {
        console.log("Generating new key...");
        this._generate_key().then((key) => {
            //associate the new key
            this.associate(key).then((response) => {
                if(response.Success) {
                    console.log("Associated!");
                    this.ls.setItem("RawAESKey",key.raw);
                    this.AESKey = key.crypto;
                    this.ls.setItem("KeyID", response.Id);
                } else {
                    console.log("Association Failed!");
                    console.log("Ensure everythign is running correctly, check the logs, and cry for help");
                }
            });
        });
    }

    get_logins (url, submit_url) {
        console.log("Getting logins for '"+url+"'...");
        this._get_logins(url, submit_url).then((response) => {
            console.log(response);
        });
    }

    constructor(ls) {
        //this.background = chrome.extension.getBackgroundPage();
        this.ls = ls;
        
        //this.ls = this.background;
        if (this.ls.getItem("ConnectorUrl") === undefined || this.ls.getItem("ConnectorUrl") === null){
            this.ls.setItem("ConnectorUrl","http://localhost:19455/");
        }

        //if there is no key in storage
        if (this.ls.getItem("RawAESKey") === undefined || this.ls.getItem("RawAESKey") === null){
            this.generate_new_key();
        } else {
            this._get_key_from_raw(this.ls.getItem("RawAESKey")).then((key) => {
                this.AESKey = key;

                this.test_associate().then((response) => {
                    if(!response.Success){
                        console.log("Our key is invalid! We need to regenerate");
                        this.generate_new_key();
                    } else {
                        console.log("successfully re-associated!");
                    }
                });
            });
        }
    }
}
