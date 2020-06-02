function saveOptions(e) {
    browser.storage.sync.set({
      autoComplete: document.querySelector("#autocomp").value
    });
    e.preventDefault();
  }
  
function restoreOptions() {  
    var gettingItem = browser.storage.sync.get('autoComplete');
    gettingItem.then((res) => {
        console.log(res.autoComplete);
        if (res.autoComplete !== undefined) {
            document.querySelector("#autocomp [value='" + res.autoComplete + "']").selected = true;
        }
    });
}
  
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
