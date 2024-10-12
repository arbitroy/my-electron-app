const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { Howl } = require('howler');

let mainWindow;
let sounds = {};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: path.join(__dirname, './images/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

app.whenReady().then(() => {
    createWindow();
    sounds = {
        fightBell: new Howl({ src: [path.join(__dirname, './sounds/fight-bell.mp3')] }),
        countdown: new Howl({ src: [path.join(__dirname, './sounds/countdown.mp3')] })
    };
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
    if (sounds[type]) {
        sounds[type].play();
    } else {
        console.log(`Sound not found: ${type}`);
    }
});

ipcMain.handle('show-error-box', async (event, { title, content }) => {
    dialog.showErrorBox(title, content);
});

ipcMain.on('save-workout', (event, workoutData) => {
    console.log('Saving workout:', workoutData);
});

ipcMain.on('load-workout', (event) => {
    console.log('Loading workout');
});

app.on('before-quit', () => {
    app.isQuitting = true;
});