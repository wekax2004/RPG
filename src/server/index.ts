import net from 'net';
import fs from 'fs';
import { PacketType, PacketReader, PacketWriter } from '../protocol';

const PORT = 3000;
const HOST = '0.0.0.0';

// Server State
let nextPlayerId = 100;
const WORLD_SEED = 1337;
const clients: Map<net.Socket, { id: number, name: string, x: number, y: number, hp: number, maxHp: number }> = new Map();
let nextItemId = 10000;
const worldItems: Map<number, { id: number, x: number, y: number, sprite: number, name: string }> = new Map();

const log = (msg: string) => {
    console.log(msg);
    // Optional: write to file if needed, but console is visible in user screenshot
    // fs.appendFileSync('server_debug.log', msg + '\n');
};

const server = net.createServer((socket) => {
    log(`[Server] Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data) => {
        try {
            log(`[Server] Received ${data.length} bytes: ${Array.from(data).slice(0, 10).join(',')}...`);

            // Wrap Buffer in Uint8Array for our Reader
            const reader = new PacketReader(new Uint8Array(data));

            while (reader.remaining() > 0) {
                const type = reader.readUint8();
                log(`[Server] Parsing Packet Type: ${type}`);

                if (type === PacketType.LOGIN) {
                    const name = reader.readString();
                    const pid = nextPlayerId++;
                    log(`[Server] LOGIN: ${name} (ID: ${pid})`);

                    // Create Player State
                    clients.set(socket, { id: pid, name, x: 0, y: 0, hp: 100, maxHp: 100 });

                    // Send LOGIN_ACK
                    const ack = new PacketWriter(128);
                    ack.writeUint8(PacketType.LOGIN_ACK); // ID
                    ack.writeUint32(pid);                 // PlayerID
                    ack.writeUint32(WORLD_SEED);          // Seed
                    ack.writeFloat32(2048);               // SpawnX (Center of 128x16 map = 1024, lets do 1024)
                    ack.writeFloat32(2048);               // SpawnY

                    const ackData = Buffer.from(ack.getData());
                    socket.write(ackData);
                    log(`[Server] Sent LOGIN_ACK (${ackData.length} bytes) to ${pid}`);

                    // Send Existing Items
                    for (const [id, item] of worldItems) {
                        const itemPkt = new PacketWriter(128);
                        itemPkt.writeUint8(PacketType.SPAWN_ITEM);
                        itemPkt.writeUint32(item.id);
                        itemPkt.writeFloat32(item.x);
                        itemPkt.writeFloat32(item.y);
                        itemPkt.writeUint16(item.sprite);
                        itemPkt.writeString(item.name);
                        socket.write(Buffer.from(itemPkt.getData()));
                    }

                } else if (type === PacketType.MOVE) {
                    const tx = reader.readFloat32();
                    const ty = reader.readFloat32();

                    const p = clients.get(socket);
                    if (p) {
                        p.x = tx;
                        p.y = ty;
                    }
                } else if (type === PacketType.CHAT) {
                    const msg = reader.readString();
                    const p = clients.get(socket);
                    if (p) {
                        log(`[Server] Chat from ${p.name}: ${msg}`);

                        // Broadcast to ALL clients
                        const chatPkt = new PacketWriter(512);
                        chatPkt.writeUint8(PacketType.CHAT);
                        chatPkt.writeUint32(p.id);
                        chatPkt.writeString(msg);

                        const data = Buffer.from(chatPkt.getData());
                        for (const [s, client] of clients) {
                            s.write(data);
                        }
                    }
                } else if (type === PacketType.ATTACK) {
                    const targetId = reader.readUint32();
                    const attacker = clients.get(socket);

                    if (attacker) {
                        // Find Target
                        let targetClient: any = null;
                        let targetSocket: net.Socket | null = null;

                        for (const [s, c] of clients) {
                            if (c.id === targetId) {
                                targetClient = c;
                                targetSocket = s;
                                break;
                            }
                        }

                        if (targetClient) {
                            // Calculate Damage
                            const dmg = Math.floor(Math.random() * 10) + 5; // 5-15 dmg
                            targetClient.hp -= dmg;
                            log(`[Server] ${attacker.name} hit ${targetClient.name} for ${dmg} HP (${targetClient.hp}/${targetClient.maxHp})`);

                            // Broadcast DAMAGE Packet (0x07)
                            // [Type u8] [TargetID u32] [Amount u32]
                            const dmgPkt = new PacketWriter(32);
                            dmgPkt.writeUint8(PacketType.DAMAGE);
                            dmgPkt.writeUint32(targetId);
                            dmgPkt.writeUint32(dmg);
                            const dmgData = Buffer.from(dmgPkt.getData());
                            for (const [s, c] of clients) {
                                s.write(dmgData);
                            }

                            // Check Death
                            if (targetClient.hp <= 0) {
                                targetClient.hp = targetClient.maxHp;
                                targetClient.x = 2048; // Respawn
                                targetClient.y = 2048;

                                // Broadcast Kill Message
                                const msg = `${targetClient.name} was killed by ${attacker.name}!`;
                                const chatPkt = new PacketWriter(512);
                                chatPkt.writeUint8(PacketType.CHAT);
                                chatPkt.writeUint32(0); // System ID
                                chatPkt.writeString(msg);
                                const chatData = Buffer.from(chatPkt.getData());
                                for (const [s, c] of clients) {
                                    s.write(chatData);
                                }
                            }
                        }
                    }
                    log(`[Server] Unknown Packet Type: ${type}`);
                    break;
                } else if (type === PacketType.SPAWN_ITEM) {
                    // Client Requesting to Spawn Item (Death Drop)
                    // [Type] [X] [Y] [Sprite] [Name]
                    const x = reader.readFloat32();
                    const y = reader.readFloat32();
                    const sprite = reader.readUint16();
                    const name = reader.readString();
                    const iId = nextItemId++;

                    const item = { id: iId, x, y, sprite, name };
                    worldItems.set(iId, item);
                    log(`[Server] Spawning Item ${name} (ID: ${iId}) at ${x},${y}`);

                    // Broadcast SPAWN_ITEM
                    const pkt = new PacketWriter(128);
                    pkt.writeUint8(PacketType.SPAWN_ITEM);
                    pkt.writeUint32(iId);
                    pkt.writeFloat32(x);
                    pkt.writeFloat32(y);
                    pkt.writeUint16(sprite);
                    pkt.writeString(name);
                    const data = Buffer.from(pkt.getData());
                    for (const [s, c] of clients) {
                        s.write(data);
                    }
                } else if (type === PacketType.ITEM_PICKUP) {
                    const iId = reader.readUint32();
                    if (worldItems.has(iId)) {
                        const item = worldItems.get(iId)!;
                        worldItems.delete(iId);
                        log(`[Server] Item ${iId} (${item.name}) picked up.`);

                        // Broadcast ITEM_DESPAWN
                        const pkt = new PacketWriter(16);
                        pkt.writeUint8(PacketType.ITEM_DESPAWN);
                        pkt.writeUint32(iId);
                        const data = Buffer.from(pkt.getData());
                        for (const [s, c] of clients) {
                            s.write(data);
                        }
                    }
                } else {
                    log(`[Server] Unknown Packet Type: ${type}`);
                    break; // Desync protection
                }
            }
        } catch (e: any) {
            log(`[Server] Error processing packet: ${e.message}`);
        }
    });

    socket.on('close', () => {
        const p = clients.get(socket);
        if (p) {
            log(`[Server] Player ${p.name} (ID: ${p.id}) disconnected`);
            clients.delete(socket);
        } else {
            log(`[Server] Client disconnected`);
        }
    });

    socket.on('error', (err) => {
        console.error(`[Server] Socket error: ${err.message}`);
    });
});

server.listen(PORT, HOST, () => {
    log(`[Server] Listening on ${HOST}:${PORT}`);

    // Broadcast Loop (20 TPS)
    setInterval(() => {
        if (clients.size === 0) return;

        const p = new PacketWriter(2048); // Increased buffer size
        p.writeUint8(PacketType.ENTITY_UPDATE);

        // Count valid players
        p.writeUint8(clients.size);

        for (const [socket, player] of clients) {
            p.writeUint32(player.id);
            p.writeFloat32(player.x);
            p.writeFloat32(player.y);
            // V2: Add HP Sync? Not strictly needed for MVP visual, but good for health bars.
            // Let's keep it simple for now to avoid breaking existing client parser.
            // V2: Add HP Sync? Not strictly needed for MVP visual, but good for health bars.
            // Let's keep it simple for now to avoid breaking existing client parser.
        }

        const data = Buffer.from(p.getData());

        // Broadcast
        for (const [socket, player] of clients) {
            if (!socket.destroyed) {
                socket.write(data);
            }
        }
    }, 50);
});
