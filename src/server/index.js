import * as net from 'net';
import { Client } from './client.js';
import { World } from './world.js';
const PORT = 3001;
export class GameServer {
    constructor() {
        Object.defineProperty(this, "server", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clients", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "world", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.world = new World();
        this.server = net.createServer((socket) => this.handleConnection(socket));
    }
    start() {
        this.server.listen(PORT, () => {
            console.log(`[Server] Listening on port ${PORT} (v3 - DEBUG)`);
        });
        // Game Loop
        setInterval(() => {
            // this.update(0.1);
        }, 100);
    }
    broadcast(packet) {
        // Need to import Packet or use Buffer. 
        // Client.send takes Packet.
        for (const client of this.clients) {
            client.send(packet);
        }
    }
    handleConnection(socket) {
        console.log(`[Server] New connection from ${socket.remoteAddress}:${socket.remotePort}`);
        const client = new Client(socket, this);
        this.clients.add(client);
        socket.on('end', () => {
            this.handleDisconnect(client);
        });
        socket.on('error', (err) => {
            console.error(`[Server] Error on socket: ${err.message}`);
            this.handleDisconnect(client);
        });
    }
    handleDisconnect(client) {
        console.log(`[Server] Client disconnected`);
        this.clients.delete(client);
    }
}
// Start Server
new GameServer().start();
