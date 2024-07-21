// popup.js
document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
      tabsList: document.getElementById('tabsList'),
      downloadBtn: document.getElementById('downloadBtn'),
      downloadAllBtn: document.getElementById('downloadAllBtn'),
      loadBtn: document.getElementById('loadBtn'),
      fileInput: document.getElementById('fileInput'),
      filenameModal: document.getElementById('filenameModal'),
      filenameModalContent: document.getElementById('filenameModalContent'),
      filenameInput: document.getElementById('filenameInput'),
      saveFilenameBtn: document.getElementById('saveFilenameBtn')
    };
  
    let urls = [];
    let selectedUrls = [];
    let downloadType = '';
  
    const renderTabs = async () => {
      const tabs = await browser.tabs.query({ currentWindow: true });
      const validTabs = tabs.filter(tab => tab.url && !tab.url.startsWith('about:'));
      
      const tabElements = validTabs.map((tab, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" id="checkbox-${index}" value="${tab.url}" /> ${tab.title}`;
        urls.push(tab.url);
        return li;
      });
  
      elements.tabsList.append(...tabElements);
    };
  
    const ensureTxtExtension = (filename) => 
      filename.endsWith('.txt') ? filename : `${filename}.txt`;
  
    const downloadURLs = (urls, filename) => {
      const blob = new Blob([urls.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ensureTxtExtension(filename);
      a.click();
      URL.revokeObjectURL(url);
    };
  
    const showFilenamePrompt = (type) => {
      downloadType = type;
      elements.filenameModal.style.display = 'flex';
    };
  
    const closeFilenameModal = () => {
      elements.filenameModal.style.display = 'none';
      elements.filenameInput.value = '';
    };
  
    const handleSaveFilename = () => {
      const filename = elements.filenameInput.value.trim();
      if (filename) {
        downloadURLs(downloadType === 'selected' ? selectedUrls : urls, filename);
        closeFilenameModal();
      } else {
        alert('Please enter a filename.');
      }
    };
  
    const handleDownload = () => {
      selectedUrls = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
      
      if (selectedUrls.length > 0) {
        showFilenamePrompt('selected');
      } else {
        alert('No URLs selected!');
      }
    };
  
    const handleFileLoad = async (file) => {
      const contents = await file.text();
      const urlsToLoad = contents.split('\n').filter(url => url.trim());
      await Promise.all(urlsToLoad.map(url => browser.tabs.create({ url })));
    };
  
    await renderTabs();
  
    elements.saveFilenameBtn.addEventListener('click', handleSaveFilename);
    elements.filenameModal.addEventListener('click', (event) => {
      if (event.target === elements.filenameModal) closeFilenameModal();
    });
    elements.downloadBtn.addEventListener('click', handleDownload);
    elements.downloadAllBtn.addEventListener('click', () => showFilenamePrompt('all'));
    elements.loadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) await handleFileLoad(file);
    });
  });