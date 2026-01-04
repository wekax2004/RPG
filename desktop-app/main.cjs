console.log("ExecPath:", process.execPath);
console.log("RUN_AS_NODE:", process.env.ELECTRON_RUN_AS_NODE);
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');

let clientSocket = null;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 630,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        backgroundColor: '#111',
        icon: path.join(__dirname, '../public/favicon.ico'),
        autoHideMenuBar: true
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // --- Networking ---
    startClient(win);

    // Open DevTools for debugging
    win.webContents.openDevTools();
}

function startClient(win) {
    if (clientSocket) {
        clientSocket.destroy();
        clientSocket = null;
    }

    clientSocket = new net.Socket();

    const connect = () => {
        clientSocket.connect(3001, '127.0.0.1', () => {
            console.log('[Main] Connected to Server (Port 3001)');
        });
    };

    connect();

    clientSocket.on('data', (data) => {
        if (!win.isDestroyed()) {
            win.webContents.send('packet-received', data);
        }
    });

    clientSocket.on('close', () => {
        console.log('[Main] Connection closed. Retrying in 2s...');
        setTimeout(() => {
            if (!win.isDestroyed()) {
                startClient(win);
            }
        }, 2000);
    });

    clientSocket.on('error', (err) => {
        console.error('[Main] Socket Error:', err.message);
    });
}

// IPC Sender
ipcMain.on('send-packet', (event, buffer) => {
    try {
        if (clientSocket && !clientSocket.destroyed) {
            // Ensure proper Buffer format
            const data = Buffer.from(buffer);
            console.log(`[Main] Sending Packet: Len=${data.length}, Byte[0]=${data[0]}, Byte[1]=${data[1]}`);
            clientSocket.write(data, (err) => {
                if (err) console.error('[Main] Write Error:', err.message);
            });
        }
    } catch (e) {
        console.error('[Main] Sync Write Error:', e.message);
    }
});

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
