const DUMMY_OPTIONS = {
    dummyTraffic: 0
}

browser.runtime.onMessage.addListener((message) => {
    console.log('MESSAGE');
    if (message.type == undefined || DUMMY_OPTIONS.dummyTraffic < 1) {
        return;
    }

    if (message.type == 'visit') {
        console.log('visit');
        const homeurl = new URL(message.url);
        console.log(homeurl.host);
        if (homeurl.host.includes('.wikipedia.org')) {
            const randomUrl = 'https://' + homeurl.host + '/wiki/Special:Random';
            browser.tabs.create({url: randomUrl, active: false}).then((tab) => {
                setTimeout(() => {browser.tabs.remove(tab.id);}, 2000);
            })            
        }
    }
});


browser.storage.sync.get('dummyTraffic').then((val) => {
    if (val.dummyTraffic !== undefined) {
        DUMMY_OPTIONS.dummyTraffic = val.dummyTraffic;
    }
});

browser.storage.onChanged.addListener((changes, area) => {
    if (changes.dummyTraffic !== undefined) {
        DUMMY_OPTIONS.dummyTraffic = changes.dummyTraffic.newValue;
    }
});