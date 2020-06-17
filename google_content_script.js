const url = new URL(window.location.href);

if (url.pathname === '/search') {
    const q = url.searchParams.get('q');
    browser.runtime.sendMessage({"type": "query", "query": q});
}


function linkClicked(e) {
    let destination = e.target.parentElement.href;
    
    if (destination !== undefined) {
        destination = new URL(destination);
        browser.runtime.sendMessage({"type": "visit", "url": destination.searchParams.get('url')});
    }
}

document.addEventListener('click', linkClicked, false);
