import { PacketType, PacketWriter, PacketReader } from './protocol';

export class NetworkManager {
    public playerId: number | null = null;
    public connected: boolean = false;
    public onLogin: ((seed: number, spawnX: number, spawnY: number) => void) | null = null;
    public onMessage: ((msg: string) => void) | null = null;
    public onStats: ((hp: number, maxHp: number, mana: number, maxMana: number) => void) | null = null;

    constructor(onLogin?: (seed: number, spawnX: number, spawnY: number) => void) {
        if (onLogin) this.onLogin = onLogin;

        // Listen for packets from Electron Main
        if ((window as any).electronAPI) {
            (window as any).electronAPI.onPacket((data: Uint8Array) => {
                this.handlePacket(data);
            });
        }
    }

    login(name: string) {
        console.log(`[Network] Sending Login for ${name}...`);
        const p = new PacketWriter(128);
        p.writeUint8(PacketType.LOGIN);
        p.writeString(name);
        this.send(p);
    }

    sendMove(x: number, y: number) {
        if (!this.connected) return;
        const p = new PacketWriter(128);
        p.writeUint8(PacketType.MOVE);
        p.writeFloat32(x);
        p.writeFloat32(y);
        this.send(p);
    }

    sendSay(msg: string) {
        // Placeholder for now
        // console.log("Sending chat:", msg);
    }

    private send(packet: PacketWriter) {
        // Check if electronAPI exists (only available in Electron app)
        if (!(window as any).electronAPI?.sendPacket) {
            // Running in browser without Electron - skip network
            return;
        }
        // Force copy to avoid serialization issues with views
        const data = packet.getData();
        const copy = new Uint8Array(data);
        // console.log(`[Network] Passing ${copy.length} bytes to Electron bridge`);
        (window as any).electronAPI.sendPacket(copy);
    }

    public onEntityUpdate: ((entities: { id: number, x: number, y: number }[]) => void) | null = null;

    // ... constructor ...

    // ... send methods ...

    private handlePacket(data: Uint8Array) {
        try {
            // Ensure data is a valid Uint8Array
            const validData = new Uint8Array(data);
            const reader = new PacketReader(validData);

            while (reader.remaining() > 0) {
                const type = reader.readUint8();

                if (type === PacketType.LOGIN_ACK) {
                    this.playerId = reader.readUint32();
                    const seed = reader.readUint32();
                    const x = reader.readFloat32();
                    const y = reader.readFloat32();

                    console.log(`[Network] Login Success! ID: ${this.playerId}, Seed: ${seed}`);
                    this.connected = true;
                    if (this.onLogin) {
                        this.onLogin(seed, x, y);
                    }
                } else if (type === PacketType.ENTITY_UPDATE) {
                    const count = reader.readUint8();
                    const entities = [];
                    for (let i = 0; i < count; i++) {
                        const id = reader.readUint32();
                        const x = reader.readFloat32();
                        const y = reader.readFloat32();
                        entities.push({ id, x, y });
                    }
                    if (this.onEntityUpdate) this.onEntityUpdate(entities);

                } else if (type === PacketType.CHAT) {
                    const pid = reader.readUint32();
                    const msg = reader.readString();
                    if (this.onChat) this.onChat(pid, msg);
                } else if (type === PacketType.SPAWN_ITEM) {
                    const id = reader.readUint32();
                    const x = reader.readFloat32();
                    const y = reader.readFloat32();
                    const sprite = reader.readUint16();
                    const name = reader.readString();
                    if (this.onSpawnItem) this.onSpawnItem(id, x, y, sprite, name);
                } else if (type === PacketType.ITEM_DESPAWN) {
                    const id = reader.readUint32();
                    if (this.onItemDespawn) this.onItemDespawn(id);
                }
            }
        } catch (e: any) {
            console.error(`[Network] Packet Error: ${e.message}`, e);
        }
    }

    public onChat: ((playerId: number, msg: string) => void) | null = null;
    public onSpawnItem: ((id: number, x: number, y: number, sprite: number, name: string) => void) | null = null;
    public onItemDespawn: ((id: number) => void) | null = null;

    sendChat(msg: string) {
        if (!this.connected) return;
        // console.log(`[Network] Sending Chat: ${msg}`);
        const p = new PacketWriter(512);
        p.writeUint8(PacketType.CHAT);
        p.writeString(msg);
        this.send(p);
    }

    sendAttack(targetId: number) {
        if (!this.connected) return;
        // [Type 0x06] [TargetID u32]
        const writer = new PacketWriter(5);
        writer.writeUint8(PacketType.ATTACK);
        writer.writeUint32(targetId);
        this.send(writer);
    }

    sendSpawnItem(x: number, y: number, sprite: number, name: string) {
        if (!this.connected) return;
        const p = new PacketWriter(128);
        p.writeUint8(PacketType.SPAWN_ITEM);
        p.writeFloat32(x);
        p.writeFloat32(y);
        p.writeUint16(sprite);
        p.writeString(name);
        this.send(p);
    }

    sendPickupItem(id: number) {
        // [Type 0x09] [NetID u32]
        if (!this.connected) return;
        const p = new PacketWriter(5);
        p.writeUint8(PacketType.ITEM_PICKUP);
        p.writeUint32(id);
        this.send(p);
    }
}
