// background.js
browser.browserAction.onClicked.addListener(() => {
    browser.tabs.query({ currentWindow: true }, (tabs) => {
      console.log("Tabs in current window:");
      tabs.forEach((tab) => {
        console.log(`${tab.index}: ${tab.title}`);
      });
    });
  });
  
  function updateIcon(theme) {
    const isDarkMode = theme.matches;
    const strokeColor = isDarkMode ? '#ffffff' : '#000000'; // White for dark mode, black for light mode
    
    fetch('icon.svg')
      .then(response => response.text())
      .then(svg => {
        const coloredSvg = svg.replace(/stroke="#[0-9a-fA-F]{6}"/g, `stroke="${strokeColor}"`);
        const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
  
        browser.browserAction.setIcon({
          path: {
            16: url,
            48: url,
            128: url
          }
        });
      })
      .catch(error => console.error('Failed to fetch or update SVG icon:', error));
  }
  
  // Listen for changes in the color scheme
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', (e) => updateIcon(e));
  updateIcon(darkModeMediaQuery);
  
  browser.runtime.onInstalled.addListener(() => {
    updateIcon(darkModeMediaQuery);
  });
  