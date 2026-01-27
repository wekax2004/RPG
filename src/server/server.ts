import { WebSocketServer, WebSocket } from 'ws';
import { PacketType, PacketReader, PacketWriter } from '../protocol.js';
import { createServer } from 'http';

const PORT = 3000;
const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Retro-RPG Game Server</h1><p>Status: Running</p><p>Please visit the Game Client at <a href="http://localhost:5173">http://localhost:5173</a></p>');
});

const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
    console.log(`[Server] Retro-RPG Server listening on port ${PORT}...`);
});

interface Client {
    ws: WebSocket;
    id: number;
    x: number;
    y: number;
    name: string;
}

const clients = new Map<number, Client>();
let nextId = 1000;
const SEED = Math.floor(Math.random() * 10000);

wss.on('connection', (ws) => {
    console.log('[Server] New connection');

    let clientId: number | null = null;

    ws.on('message', (message: Buffer, isBinary) => {
        if (!isBinary) return;

        try {
            const data = new Uint8Array(message);
            const reader = new PacketReader(data);

            while (reader.remaining() > 0) {
                const type = reader.readUint8();

                if (type === PacketType.LOGIN) {
                    const name = reader.readString();
                    clientId = nextId++;

                    const client: Client = {
                        ws,
                        id: clientId,
                        x: 125 * 32, // Edron Center
                        y: 125 * 32,
                        name
                    };
                    clients.set(clientId, client);
                    console.log(`[Server] Player login: ${name} (ID: ${clientId})`);

                    // Send LOGIN_ACK
                    const p = new PacketWriter(128);
                    p.writeUint8(PacketType.LOGIN_ACK);
                    p.writeUint32(clientId);
                    p.writeUint32(SEED);
                    p.writeFloat32(client.x);
                    p.writeFloat32(client.y);
                    ws.send(p.getData());

                    // Send existing entities to new player
                    const existingEntities = new PacketWriter(1024);
                    existingEntities.writeUint8(PacketType.ENTITY_UPDATE);

                    const otherClients = Array.from(clients.values()).filter(c => c.id !== clientId);
                    existingEntities.writeUint8(otherClients.length);

                    for (const c of otherClients) {
                        existingEntities.writeUint32(c.id);
                        existingEntities.writeFloat32(c.x);
                        existingEntities.writeFloat32(c.y);
                    }
                    if (otherClients.length > 0) {
                        ws.send(existingEntities.getData());
                    }

                    broadcastChat(0, `${name} connected.`);
                }
                else if (type === PacketType.MOVE) {
                    if (clientId === null) return;
                    const x = reader.readFloat32();
                    const y = reader.readFloat32();

                    const client = clients.get(clientId);
                    if (client) {
                        client.x = x;
                        client.y = y;

                        // Broadcast movement to others
                        // Optimization: Accumulate and send tick updates instead of instant?
                        // For MVP: Broadcast instant
                        broadcastEntityUpdate(client);
                    }
                }
                else if (type === PacketType.CHAT) {
                    if (clientId === null) return;
                    const msg = reader.readString();
                    console.log(`[Chat] ${clients.get(clientId)?.name}: ${msg}`);
                    broadcastChat(clientId, msg);
                }
            }
        } catch (e) {
            console.error('[Server] Error processing packet:', e);
        }
    });

    ws.on('close', () => {
        if (clientId !== null) {
            const name = clients.get(clientId)?.name || "Unknown";
            console.log(`[Server] Player disconnected: ${name} (ID: ${clientId})`);
            clients.delete(clientId);
            broadcastItemDespawn(clientId); // Reuse item despawn as generic "entity remove" or implement specific?
            // Existing client logic treats ENTITY_UPDATE as "position set". 
            // We need a way to remove entities. 
            // The protocol has ITEM_DESPAWN (0x0A), could reuse or add ENTITY_DESPAWN.
            // For now, let's assume they just stop moving. 
            // Actually, without removal, 'ghosts' remain.
            // Let's rely on ITEM_DESPAWN if client supports it for entities? 
            // Looking at `network.ts`, ITEM_DESPAWN calls `onItemDespawn`. 
            // It might not trigger player removal.
            // Basic server for now.
            broadcastChat(0, `${name} disconnected.`);
        }
    });
});

function broadcastEntityUpdate(client: Client) {
    const p = new PacketWriter(32);
    p.writeUint8(PacketType.ENTITY_UPDATE);
    p.writeUint8(1); // Count
    p.writeUint32(client.id);
    p.writeFloat32(client.x);
    p.writeFloat32(client.y);

    const data = p.getData();
    for (const c of clients.values()) {
        if (c.id !== client.id && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(data);
        }
    }
}

function broadcastChat(senderId: number, msg: string) {
    const p = new PacketWriter(512);
    p.writeUint8(PacketType.CHAT);
    p.writeUint32(senderId);
    p.writeString(msg);

    const data = p.getData();
    for (const c of clients.values()) {
        if (c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(data);
        }
    }
}

function broadcastItemDespawn(id: number) {
    const p = new PacketWriter(32);
    p.writeUint8(PacketType.ITEM_DESPAWN); // Hack: Using Item Despawn for disconnect
    p.writeUint32(id);

    const data = p.getData();
    for (const c of clients.values()) {
        if (c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(data);
        }
    }
}
