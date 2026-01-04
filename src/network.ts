import { Packet, OpCode } from './server/protocol';

// Interface for the Preload API
interface NetworkAPI {
    sendPacket: (buffer: Uint8Array) => void;
    onPacket: (callback: (data: Uint8Array) => void) => void;
}

declare global {
    interface Window {
        networkAPI: NetworkAPI;
    }
}

export class NetworkManager {
    public onMessage: (msg: string) => void = () => { };
    public onStats: (hp: number, maxHp: number, mana: number, maxMana: number) => void = () => { };

    private buffer: Uint8Array = new Uint8Array(0);

    constructor() {
        if (window.networkAPI) {
            window.networkAPI.onPacket((data) => this.handleData(data));
            console.log("NetworkManager: Connected to Bridge");

            // Send Login Packet Example
            this.sendLogin("Player1");
        } else {
            console.warn("NetworkManager: No networkAPI found (Browser Mode?)");
        }
    }

    private handleData(data: Uint8Array) {
        // Concat buffer
        const newBuf = new Uint8Array(this.buffer.length + data.length);
        newBuf.set(this.buffer);
        newBuf.set(data, this.buffer.length);
        this.buffer = newBuf;

        // Process Packets
        while (this.buffer.length >= 2) {
            // Read Length (Little Endian)
            const length = this.buffer[0] | (this.buffer[1] << 8);

            if (this.buffer.length < length + 2) {
                break;
            }

            // Extract Body
            const body = this.buffer.subarray(2, 2 + length);

            // Create Packet wrapper
            // Note: server/Packet uses Buffer. Node Buffer is Uint8Array subclass, but we might need a browser-compatible Packet class
            // or polyfill Buffer. Vite polyfills Buffer usually? 
            // Let's assume we need to adjust Packet class to work with Uint8Array if Buffer is missing.
            // For now, let's try assuming standard Buffer works or use a simple DataView approach if straightforward.
            // Actually, `server/protocol.ts` imports `Buffer`. We need to verify if that works in Vite.
            // Vite usually requires `vite-plugin-node-polyfills` or similar.
            // Alternatively, we rewrite Packet to be isomorphic (DataView).

            // For this step, I'll pass it to a handler that assumes it works, 
            // but I suspect I might need to refactor `Packet` to be isomorphic.
            this.handlePacket(body);

            // Scavenge
            this.buffer = this.buffer.subarray(2 + length);
        }
    }

    private handlePacket(data: Uint8Array) {
        try {
            const packet = new Packet(data);
            const op = packet.readOpCode();

            if (op === OpCode.SAY) {
                const msg = packet.readString();
                console.log(`[Net] Chat: ${msg}`);
                if (this.onMessage) this.onMessage(msg);
            } else if (op === OpCode.UPDATE_STATS) {
                const hp = packet.readUint16();
                const maxHp = packet.readUint16();
                const mana = packet.readUint16();
                const maxMana = packet.readUint16();
                console.log(`[Net] Stats Update - HP: ${hp}/${maxHp}, Mana: ${mana}/${maxMana}`);
                if (this.onStats) this.onStats(hp, maxHp, mana, maxMana);
            } else {
                console.log(`[Net] OpCode: ${op}`);
            }
        } catch (e) { console.error(e); }
    }

    private sendRaw(packet: Packet) {
        const body = packet.getBuffer();
        const length = body.length;

        // Create framed buffer: [Len (2 bytes)] + [Body]
        const framed = new Uint8Array(2 + length);

        // Write Length (Little Endian)
        framed[0] = length & 0xFF;
        framed[1] = (length >> 8) & 0xFF;

        // Copy Body
        framed.set(body, 2);

        console.log(`[Net] Sending Framed Packet (BodyLen: ${length})`);
        window.networkAPI.sendPacket(framed);
    }

    sendLogin(name: string) {
        const p = new Packet();
        p.writeOpCode(OpCode.LOGIN);
        p.writeString(name);
        this.sendRaw(p);
    }

    sendMove(dx: number, dy: number) {
        const p = new Packet();
        p.writeOpCode(OpCode.MOVE);
        p.writeUint8(dx + 128);
        p.writeUint8(dy + 128);
        this.sendRaw(p);
    }

    sendSay(msg: string) {
        const p = new Packet();
        p.writeOpCode(OpCode.SAY); // 48
        p.writeString(msg);
        console.log(`[Net] Queuing SAY: ${msg}`);
        this.sendRaw(p);
    }

    sendDamage(amount: number) {
        const p = new Packet();
        p.writeOpCode(OpCode.DAMAGE);
        p.writeUint16(amount);
        this.sendRaw(p);
    }
}
