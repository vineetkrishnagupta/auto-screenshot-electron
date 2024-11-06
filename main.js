// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const screenshot = require('screenshot-desktop');
const path = require('path');
const fs = require('fs');

let mainWindow;
let screenshotInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to take a screenshot and save it
async function takeScreenshot() {
  try {
    const img = await screenshot();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(__dirname, `screenshot-${timestamp}.png`);

    fs.writeFileSync(filePath, img);
    console.log('Screenshot saved to', filePath);
    
    // Send success message to renderer
    mainWindow.webContents.send('screenshot-taken', `Screenshot saved to ${filePath}`);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    mainWindow.webContents.send('screenshot-error', 'Failed to take screenshot');
  }
}

// Start taking screenshots every 5 seconds
function startScreenshots() {
  if (!screenshotInterval) {
    screenshotInterval = setInterval(takeScreenshot, 5000); // Every 5 seconds
  }
}

// Stop taking screenshots
function stopScreenshots() {
  clearInterval(screenshotInterval);
  screenshotInterval = null;
  mainWindow.webContents.send('screenshot-stopped', 'Screenshot capturing stopped.');
}

// Listen for start/stop requests from the renderer process
ipcMain.on('start-screenshots', startScreenshots);
ipcMain.on('stop-screenshots', stopScreenshots);

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
