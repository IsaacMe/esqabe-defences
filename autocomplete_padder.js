const OPTIONS = {
    autoComplete: 0
}

const URLS = [
    "https://www.google.com/complete/search?*"
]

let latest_received = 0;


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
    if (OPTIONS.autoComplete >= 1) { 
        e.requestHeaders.push({ name: 'X-Padding', value: randString(randInt(0, 40))})
    }

    return { requestHeaders: e.requestHeaders };
}

async function cancelIfNess(e) {
    if (OPTIONS.autoComplete >= 3) {
        return { cancel: true };
    } else if (OPTIONS.autoComplete >= 2) {
        const t = Date.now();
        latest_received = t;
        await new Promise(r => setTimeout(r, 500));
        if (t < latest_received) {
            return { cancel: true };
        }
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
    if (val.autoComplete !== undefined) {
        OPTIONS.autoComplete = val.autoComplete;
    }
});

browser.storage.onChanged.addListener((changes, area) => {
    if (changes.autoComplete !== undefined) {
        OPTIONS.autoComplete = changes.autoComplete.newValue;
    }
});