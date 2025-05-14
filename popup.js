// popup.js: UI logic for settings and switch

document.addEventListener('DOMContentLoaded', async () => {
  const cloudMode = document.getElementById('cloudMode');
  const cloudSettings = document.getElementById('cloudSettings');
  const apiKey = document.getElementById('apiKey');
  const modelName = document.getElementById('modelName');
  const saveBtn = document.getElementById('saveBtn');

  // Load saved settings
  chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel'], (result) => {
    cloudMode.checked = !!result.cloudMode;
    cloudSettings.style.display = cloudMode.checked ? '' : 'none';
    apiKey.value = result.openrouterApiKey || '';
    modelName.value = result.openrouterModel || '';
  });

  cloudMode.addEventListener('change', () => {
    cloudSettings.style.display = cloudMode.checked ? '' : 'none';
  });

  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({
      cloudMode: cloudMode.checked,
      openrouterApiKey: apiKey.value,
      openrouterModel: modelName.value
    }, () => {
      saveBtn.textContent = 'Сохранено!';
      setTimeout(() => saveBtn.textContent = 'Сохранить', 1200);
    });
  });
});
