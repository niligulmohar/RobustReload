function getText(id) {
  return document.getElementById(id).value;
}

function setText(id, text) {
  document.getElementById(id).value = text;
}

function validate() {
  var reloadDelay = parseInt(getText("reloadDelay"), 10);

  if (reloadDelay < 2) {
    reloadDelay = 2;
  }

  setText("reloadDelay", reloadDelay);
}

function save() {
  validate();
  localStorage.reloadDelay = parseInt(getText("reloadDelay"), 10);
}

function load() {
  setText("reloadDelay", localStorage.reloadDelay);
}

document.addEventListener("DOMContentLoaded", load);
document.querySelector("#save").addEventListener("click", save);
