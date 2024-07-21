document.addEventListener('DOMContentLoaded', async () => {
  const elements = Object.fromEntries(
    ['tabsList', 'downloadBtn', 'downloadAllBtn', 'loadBtn', 'fileInput', 'filenameModal', 'filenameInput', 'saveFilenameBtn']
    .map(id => [id, document.getElementById(id)])
  );

  let urls = [];

  const renderTabs = async () => {
    try {
      const tabs = await browser.tabs.query({ currentWindow: true });
      const tabElements = tabs
        .filter(tab => tab.url && !tab.url.startsWith('about:'))
        .map(tab => {
          urls.push(tab.url);
          return `<li><input type="checkbox" value="${tab.url}" /> ${tab.title}</li>`;
        });

      elements.tabsList.innerHTML = tabElements.join('');
      
      if (urls.length === 0) {
        elements.downloadBtn.disabled = true;
        elements.downloadAllBtn.disabled = true;
      } else {
        elements.downloadBtn.disabled = false;
        elements.downloadAllBtn.disabled = false;
      }
    } catch (error) {
      console.error('Failed to render tabs:', error);
    }
  };

  const downloadURLs = (urls, filename) => {
    const blob = new Blob([urls.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: url,
      download: filename.endsWith('.txt') ? filename : `${filename}.txt`
    }).click();
    URL.revokeObjectURL(url);
  };

  const showFilenamePrompt = (type) => {
    elements.filenameModal.style.display = 'flex';
    elements.saveFilenameBtn.onclick = () => {
      const filename = elements.filenameInput.value.trim();
      if (filename) {
        downloadURLs(type === 'selected' 
          ? [...elements.tabsList.querySelectorAll('input:checked')].map(cb => cb.value)
          : urls, 
        filename);
        elements.filenameModal.style.display = 'none';
        elements.filenameInput.value = '';
      }
    };
  };

  const handleFileLoad = async (file) => {
    try {
      const tabsArray = (await file.text()).split('\n').filter(url => url.trim());
      const { id: windowId } = await browser.windows.getCurrent();
      await Promise.all(tabsArray.map(url => 
        browser.tabs.create({ windowId, url }).catch(error => 
          console.error(`Failed to create tab for URL: ${url}`, error)
        )
      ));
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  await renderTabs();

  elements.downloadBtn.onclick = () => showFilenamePrompt('selected');
  elements.downloadAllBtn.onclick = () => showFilenamePrompt('all');
  elements.loadBtn.onclick = () => elements.fileInput.click();
  elements.fileInput.onchange = (event) => handleFileLoad(event.target.files[0]);
  elements.filenameModal.onclick = (event) => {
    if (event.target === elements.filenameModal) {
      elements.filenameModal.style.display = 'none';
    }
  };
});
