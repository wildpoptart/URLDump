// background.js
browser.browserAction.onClicked.addListener(() => {
    browser.tabs.query({ currentWindow: true }, (tabs) => {
      console.log("Tabs in current window:");
      tabs.forEach((tab) => {
        console.log(`${tab.index}: ${tab.title}`);
      });
    });
  });
  