const STATE = {
    latestQuery: undefined,
    pattern: [],
    queryRegex: undefined,
    websitesOpened: [],
    results: [],
}

function saveState() {
    browser.storage.local.set({
        state: STATE
    });
}

async function supportsESNI(domain) {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=_esni.${domain}&type=TXT`, {
        headers: {
            'Accept': 'application/dns-json',
        }
    });
    const jresp = await response.json();

    found = false;

    if (jresp.Answer == undefined) {
        return found;
    }

    for (const ans of jresp.Answer) {
        if (ans.name.startsWith('_esni.')) {
            found = true;
            break;
        }
    }
    return found;
}


browser.runtime.onMessage.addListener((message) => {
    if (message.type == undefined) {
        return;
    }

    if (message.type == 'query') {
        if (message.query == STATE.latestQuery) {
            return;
        }

        STATE.latestQuery = message.query;
        STATE.pattern = STATE.latestQuery.split(" ").map(x => x.length)
        STATE.queryRegex = new RegExp('\\W' + STATE.pattern.map(x => `[\\w-]{${x}}`).join(' ') + '\\W', 'g');
        STATE.websitesOpened = [];
        STATE.results = [];
        saveState();
    } else if (message.type == 'visit') {
        const homeurl = new URL(message.url);
        
        fetch("https://" + homeurl.host).then((resp) => {
            return resp.text().then(async (text) => {
                const parser = new DOMParser();
                const html = parser.parseFromString(text, 'text/html');
                STATE.results.push(...(html.getElementsByTagName('body')[0].innerText.toLowerCase().match(STATE.queryRegex).map(x => x.substring(1, x.length - 1))))

                const supportsEsni = await supportsESNI(homeurl.host);
                
                STATE.websitesOpened.push({'url': message.url, 'host': homeurl.host, 'onHome': text.toLowerCase().includes(STATE.latestQuery.toLowerCase()), 'esni': supportsEsni});
                saveState();
            })
        }).catch((err) => {
            console.log(err);
            STATE.websitesOpened.push({'url': message.url, 'host': homeurl.host, 'onHome': false});
            saveState();
        });
    }
});
