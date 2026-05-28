const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // Terminal olduğu üçün tam ekran başlasın istəyirsənsə:
    // fullscreen: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // Başlığı və çərçivəni gizlətmək (dizayndakı kimi professional görünsün deyə)
    // titleBarStyle: 'hidden', 
  });

  // Əgər Vite istifadə edirsənsə port adətən 5173 olur, Create React App isə 3000
  // Sənin React proqramın hansı portda qaçırsa onu yaz:
  win.loadURL('http://localhost:5173'); 

  // Proqram açılan kimi Developer Tool-un (F12) açılmasını istəmirsənsə aşağıdakı sətri sil
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});