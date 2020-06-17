const errorFiels = {
    notActive: document.getElementById("err-no-active-search"),
    lengthDefence: document.getElementById("err-length-defence")
}

const fields = {
    query: document.getElementById("val-search"),
    queryLength: document.getElementById("val-query-length"),
    cardLength: document.getElementById("card-length"),
    cardWebsites: document.getElementById("card-websites"),
    websitesList: document.getElementById("val-websites-list"),
    cardResults: document.getElementById("card-results"),
    resultsList: document.getElementById("val-results"),
    esniChecking: document.getElementById("esni-checking"),
    esniEnabled: document.getElementById("esni-enabled"),
    esniDisabled: document.getElementById("esni-disabled"),
}

const OPTIONS = {
    autoComplete: 0
}

let state = {};

function hideAllErrors() {
    for (const [key, field] of Object.entries(errorFiels)) {
        field.classList.add('hidden');
    }
}

function makeCounter(array) {
    let count = {};
    array.forEach(val => count[val] = (count[val] || 0) + 1);
    let countResult = Object.entries(count);
    countResult.sort((f, s) => {
        return s[1] - f[1];
    });

    return countResult;
  }

function show(element) {
    element.classList.remove('hidden');
}

function hide(element) {
    element.classList.add('hidden');
}

function checkESNI() {
    
}

function esniUpdate() {
    if (OPTIONS.esniEnabled === undefined) {
        show(fields.esniChecking);
        hide(fields.esniEnabled);
        hide(fields.esniDisabled);
    } else if (OPTIONS.esniEnabled) {
        hide(fields.esniChecking);
        show(fields.esniEnabled);
        hide(fields.esniDisabled);
    } else {
        hide(fields.esniChecking);
        hide(fields.esniEnabled);
        show(fields.esniDisabled);
    }
}

function stateUpdate() {
    if (state === undefined) {
        show(errorFiels.notActive);
        return;
    }

    if (state.latestQuery !== undefined) {
        hide(errorFiels.notActive);
        fields.query.innerText = state.latestQuery;

        if (OPTIONS.autoComplete < 1) {
            fields.queryLength.innerText = state.pattern;
            hide(errorFiels.lengthDefence);
            show(fields.cardLength);
        } else {
            hide(fields.cardLength);
            show(errorFiels.lengthDefence);
        }

    } else {
        show(errorFiels.notActive);
    }

    if (state.websitesOpened !== undefined && state.websitesOpened.length > 0) {
        fields.websitesList.innerHTML = '';

        for (const site of state.websitesOpened) {
            let icon = '';
            let host = site.host;

            if (site.onHome) {
                icon = '<span class="emoji">⚠️</span>';
            }

            if (site.esni) {
                icon += '<span class="emoji">🔒</span>';

                if (OPTIONS.esniEnabled) {
                    host = `<span class="domain-hidden">${host}</span>`;
                }
            }

            fields.websitesList.innerHTML += `<li>${host} ${icon}</li>`;
        }

        show(fields.cardWebsites);
    } else {
        hide(fields.cardWebsites);
    }

    if (OPTIONS.autoComplete < 1 && state.results !== undefined && state.results.length > 0) {
        fields.resultsList.innerHTML = '';
        
        for (const query of makeCounter(state.results).slice(0,3)) {
            let found = '';
            if (state.latestQuery.toLowerCase() === query[0].toLowerCase()) {
                found = '<span class="emoji">✅</span>';
            }
            fields.resultsList.innerHTML += `<li>${query[0]} ${query[1]} ${found}</li>`;
        }

        show(fields.cardResults);
    } else {
        hide(fields.cardResults);
    }
}

browser.storage.local.get('state').then((val) => {
    state = val.state;
    stateUpdate();
});

browser.storage.onChanged.addListener((changes, area) => {
    if (changes.state !== undefined) {
        state = changes.state.newValue;
    } else if (changes.autoComplete !== undefined) {
        OPTIONS.autoComplete = changes.autoComplete.newValue;
    } else if (changes.esniEnabled !== undefined) {
        OPTIONS.esniEnabled = changes.esniEnabled.newValue;
        esniUpdate();
    }
    stateUpdate();
});

browser.storage.local.get('esniEnabled').then((val) => {
    if (val.esniEnabled !== undefined) {
        OPTIONS.esniEnabled = val.esniEnabled;
        esniUpdate();
    }
});

browser.storage.sync.get('autoComplete').then((val) => {
    if (val.autoComplete !== undefined) {
        OPTIONS.autoComplete = val.autoComplete;
        stateUpdate();
    }
});

document.getElementById('button-options').addEventListener("click", (ev) => {
    browser.runtime.openOptionsPage();
});

hideAllErrors();
hide(fields.cardWebsites);
hide(fields.cardResults);
hide(fields.esniDisabled);
hide(fields.esniEnabled);
