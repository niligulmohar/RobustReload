localStorage.reloadDelay = localStorage.reloadDelay || 10;

function getReloadDelay() {
  return localStorage.reloadDelay * 1000;
}

var running = false;
var tabs = [];
var originalTabId = null;
var frontTabIndex = 0;
var timeoutId = null;
var url = null;

function backTabIndex() {
  return (frontTabIndex + 1) % tabs.length;
}

function backTabId() {
  return tabs[backTabIndex()].id;
}

function start() {
  if (running) {
    stop();
  }
  running = true;

  tabs = [];
  frontTabIndex = 0;

  for (var i=0; i<2; i++) {
    chrome.tabs.create({ selected: false,
			 url: "about:blank" },
		       function (newTab) {
			 tabs.push(newTab);
			 if (tabs.length === 2) {
			   next("attemptLoad", 0);
			 }
		       });
  }
}

function stop() {
  if (!running) {
    return;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  tabs.forEach(function (tab) {
    chrome.tabs.remove(tab.id, function () {
      tabs.pop();
      if (tabs.length === 0) {
	chrome.tabs.update(originalTabId, { selected: true });
	running = false;
      }
    });
  });
}

function next(state, delay) {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (delay) {
    timeoutId = setTimeout(function () { performNext(state); },
			   delay);
  } else {
    performNext(state);
  }
}

function performNext(state) {
  timeoutId = null;

  switch (state) {
  case "attemptLoad":
    chrome.tabs.update(backTabId(), { url: url });
    next("attemptLoad", getReloadDelay());
    break;
  case "flip":
    chrome.tabs.update(backTabId(), { selected: true });
    frontTabIndex = backTabIndex();
    next("attemptLoad", getReloadDelay());
    break;
  }
}

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
  if (running && sender.tab.id === backTabId()) {
    next("flip");
  }
  sendResponse();
});

chrome.browserAction.onClicked.addListener(function (selectedTab) {
  if (running) {
    chrome.browserAction.setIcon({ path: "rereload.png" });
    stop();
  } else {
    chrome.browserAction.setIcon({ path: "rereload-red.png" });
    originalTabId = selectedTab.id;
    url = selectedTab.url;
    start();
  }
});

