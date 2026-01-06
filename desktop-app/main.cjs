const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');

// Prevent EPIPE crashes if console/pipe is closed
if (process.stdout && process.stdout.on) {
    process.stdout.on('error', (err) => { if (err.code === 'EPIPE') { /* ignore */ } });
}
if (process.stderr && process.stderr.on) {
    process.stderr.on('error', (err) => { if (err.code === 'EPIPE') { /* ignore */ } });
}

let clientSocket = null;
let messageQueue = [];

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

    const isDev = !app.isPackaged; // or use process.env.NODE_ENV

    // For this environment, we can assume localhost for dev if arguments suggest, but let's stick to standard check
    // Actually, previously we used:
    win.loadURL('http://localhost:5173');

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

    const fs = require('fs');
    let targetHost = '127.0.0.1';
    let targetPort = 3000;

    // Try to load config
    try {
        const configPath = path.join(path.dirname(process.execPath), 'server_config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.host) targetHost = config.host;
            if (config.port) targetPort = config.port;
            console.log(`[Main] Loaded config from ${configPath}: ${targetHost}:${targetPort}`);
        } else {
            // Dev fallback
            const devConfig = path.join(__dirname, 'server_config.json');
            if (fs.existsSync(devConfig)) {
                const config = JSON.parse(fs.readFileSync(devConfig, 'utf8'));
                if (config.host) targetHost = config.host;
                if (config.port) targetPort = config.port;
                console.log(`[Main] Loaded dev config: ${targetHost}:${targetPort}`);
            }
        }
    } catch (e) {
        console.error("[Main] Config Load Error:", e);
    }

    const connect = () => {
        clientSocket.connect(targetPort, targetHost, () => {
            console.log(`[Main] Connected to Server (${targetHost}:${targetPort})`);

            // Flush Queue
            if (messageQueue.length > 0) {
                console.log(`[Main] Flushing ${messageQueue.length} buffered packets...`);
                while (messageQueue.length > 0) {
                    const next = messageQueue.shift();
                    clientSocket.write(next);
                }
            }
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
    // console.log(`[Main] IPC 'send-packet' received. Buffer type: ${typeof buffer}`);
    try {
        const data = Buffer.from(buffer);

        if (clientSocket && !clientSocket.destroyed && clientSocket.readyState === 'open') {
            console.log(`[Main] Sending Packet to Server: Len=${data.length}, Byte[0]=${data[0]}`);
            clientSocket.write(data, (err) => {
                if (err) console.error('[Main] Write Error:', err.message);
            });
        } else {
            console.log(`[Main] Socket not ready. Buffering packet (Len=${data.length})...`);
            messageQueue.push(data);
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
