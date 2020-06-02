const OPTIONS = {
    autoComplete: 0
}

const URLS = [
    "https://www.google.com/complete/search?*"
]


function randInt(min, max) {
    return Math.floor(((window.crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000) * (max - min)) + min);
}

function randString(l) {
    let n = "";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.:;";
    for (e = 0; e < l; e++)
        n += chars.charAt(randInt(0, chars.length));
    return n
}

function addRandomPadding(e) {
    console.log(OPTIONS.autoComplete);
    if (OPTIONS.autoComplete >= 1) { 
        e.requestHeaders.push({ name: 'X-Padding', value: randString(randInt(3, 50))})
    }

    return { requestHeaders: e.requestHeaders };
}

function cancelIfNess(e) {
    if (OPTIONS.autoComplete >= 3) {
        return { cancel: true };
    }
}
  

browser.webRequest.onBeforeRequest.addListener(
    cancelIfNess,
    {urls: URLS},
    ["blocking"]
);

browser.webRequest.onBeforeSendHeaders.addListener(
    addRandomPadding,
    {urls: URLS},
    ["blocking", "requestHeaders"]
);


// "https://*/complete/search"

browser.storage.sync.get('autoComplete').then((val) => {
    OPTIONS.autoComplete = val.autoComplete;
});

browser.storage.onChanged.addListener((changes, area) => {
    OPTIONS.autoComplete = changes.autoComplete.newValue;
});