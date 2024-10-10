const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isTimerRunning = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.png')); // You need to add an icon file
    updateTrayMenu();
}

function updateTrayMenu() {
    const contextMenu = Menu.buildFromTemplate([
        {
            label: isTimerRunning ? 'Stop Timer' : 'Start Timer',
            click: () => {
                isTimerRunning = !isTimerRunning;
                mainWindow.webContents.send('toggle-timer', isTimerRunning);
                updateTrayMenu();
            }
        },
        { type: 'separator' },
        { label: 'Show App', click: () => mainWindow.show() },
        { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Tabata Timer');
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('play-sound', (event, type) => {
    console.log(`Playing sound: ${type}`);
});

ipcMain.on('save-workout', (event, workoutData) => {
    console.log('Saving workout:', workoutData);
});

ipcMain.on('load-workout', (event) => {
    console.log('Loading workout');
});

ipcMain.on('timer-status-changed', (event, status) => {
    isTimerRunning = status;
    updateTrayMenu();
});

mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
    }
    return false;
});

app.on('before-quit', () => {
    app.isQuitting = true;
});