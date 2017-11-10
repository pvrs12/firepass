/*let nonce = CryptoJS.enc.Base64.parse("epIt2nuAZbHt5JgEsxolWg==")
let message = nonce.toString(CryptoJS.enc.Base64);
let key = CryptoJS.enc.Base64.parse("CRyXRbH9vBkdPrkdm52S3bTG2rGtnYuyJttk/mlJ15g=");

console.log("Key:", key.toString(CryptoJS.enc.Base64));
console.log("IV:", nonce.toString(CryptoJS.enc.Base64));
console.log("Nonce:", message);

let encrypted = CryptoJS.AES.encrypt(message, key, {iv: nonce});
console.log("Encrypted: ", encrypted.ciphertext.toString(CryptoJS.enc.Base64));

let decrypted = CryptoJS.AES.decrypt(encrypted, key, {iv: nonce});
*/

/*
let nonce = crypto.getRandomValues(new Uint8Array(16));
let message = KeepassHtml._arrayBufferToBase64(nonce);
let alg = { name: "AES-CBC", iv: nonce, length: 256 }
console.log("nonce:", message);
crypto.subtle.generateKey(alg, true, ["encrypt", "decrypt"]).then((key) => {
    crypto.subtle.exportKey("raw", key).then((raw_key) => {
        console.log("key:", KeepassHtml._arrayBufferToBase64(raw_key));
        
        crypto.subtle.encrypt(alg, key, new TextEncoder("utf-8").encode(message)).then((encrypted) => {
            console.log("result:", KeepassHtml._arrayBufferToBase64(encrypted));
        });
    });
  
}).catch((fail) => {
    console.log("fail:", fail);
});
*/

var ls = window.content.localStorage;

function setItem(key, value){
    ls.setItem(key, value);
}

function getItem(key){
    return ls.getItem(key);
}

var kph = new KeepassHtml (ls);