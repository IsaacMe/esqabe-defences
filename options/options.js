function saveOptions(e) {
    browser.storage.sync.set({
      autoComplete: document.querySelector("#autocomp").value
    });
    e.preventDefault();
  }

  function saveDummy(e) {
    e.preventDefault();
    browser.storage.sync.set({
      dummyTraffic: document.querySelector("#dummy").value
    });
  }
  
function restoreOptions() {  
    var gettingItem = browser.storage.sync.get('autoComplete');
    gettingItem.then((res) => {
        if (res.autoComplete !== undefined) {
            document.querySelector("#autocomp [value='" + res.autoComplete + "']").selected = true;
        }
    });

    var gettingItem = browser.storage.sync.get('dummyTraffic');
    gettingItem.then((res) => {
        if (res.dummyTraffic !== undefined) {
            document.querySelector("#dummy [value='" + res.dummyTraffic + "']").selected = true;
        }
    });
}

function uuidV4() {
  // Based on https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
  const b = [...window.crypto.getRandomValues(new Uint8Array(16))].map(x => ('00' + x.toString(16)).slice(-2));
  b.splice(10, 0, '-')
  b.splice(8, 0, '-')
  b.splice(6, 0, '-')
  b.splice(4, 0, '-')
  return b.join('');
}

function checkESNI() {
  fetch('https://' + uuidV4() + '.encryptedsni.com/cdn-cgi/trace').then(async resp => {
    const t = await resp.text();
    const info = t.split('\n').map(x => x.split('='));

    let enabled = false;
    let tlsVersion = 'unkown';

    for (const i of info) {
      if (i[0] === 'sni') {
        if (i[1] === 'encrypted') {
          enabled = true;
        }
      } else if (i[0] === 'tls') {
        tlsVersion = i[1];
      }
    }

    browser.storage.local.set({
      esniEnabled: enabled,
      tlsVersion: tlsVersion
    });

    let resultText = 'No, ESNI needs to be enabled. <a href="https://blog.cloudflare.com/encrypt-that-sni-firefox-edition/">Click here</a> to learn how to enable it.';

    if (enabled) {
      resultText = 'Yes';
    }

    document.getElementById('esni-enabled').innerHTML = resultText;

  }).catch(err => {
    console.log(err);
  })
}
  
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("form-comp").addEventListener("submit", saveOptions);
document.getElementById("form-dummy").addEventListener("submit", saveDummy);
document.getElementById("button-browser-cap").addEventListener("click", checkESNI);
