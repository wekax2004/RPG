export enum PacketType {
    LOGIN = 0x01,
    LOGIN_ACK = 0x02,
    MOVE = 0x03,
    ENTITY_UPDATE = 0x04,
    CHAT = 0x05,
    ATTACK = 0x06,
    DAMAGE = 0x07,
    SPAWN_ITEM = 0x08,
    ITEM_PICKUP = 0x09,
    ITEM_DESPAWN = 0x0A
}

export class PacketWriter {
    public buffer: Uint8Array;
    public view: DataView;
    public offset: number;

    constructor(size: number) {
        this.buffer = new Uint8Array(size);
        this.view = new DataView(this.buffer.buffer);
        this.offset = 0;
    }

    writeUint8(val: number) {
        this.view.setUint8(this.offset, val);
        this.offset += 1;
    }

    writeUint16(val: number) {
        this.view.setUint16(this.offset, val, true);
        this.offset += 2;
    }

    writeUint32(val: number) {
        this.view.setUint32(this.offset, val, true); // Little Endian
        this.offset += 4;
    }

    writeFloat32(val: number) {
        this.view.setFloat32(this.offset, val, true);
        this.offset += 4;
    }

    writeString(str: string) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        // Write Length (Uint16)
        this.view.setUint16(this.offset, bytes.length, true);
        this.offset += 2;
        // Write Bytes
        this.buffer.set(bytes, this.offset);
        this.offset += bytes.length;
    }

    getData(): Uint8Array {
        return this.buffer.slice(0, this.offset);
    }
}

export class PacketReader {
    public view: DataView;
    public offset: number;

    constructor(buffer: Uint8Array) {
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.offset = 0;
    }

    readUint8(): number {
        const val = this.view.getUint8(this.offset);
        this.offset += 1;
        return val;
    }

    readUint16(): number {
        const val = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return val;
    }

    readUint32(): number {
        const val = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return val;
    }

    readFloat32(): number {
        const val = this.view.getFloat32(this.offset, true);
        this.offset += 4;
        return val;
    }

    readString(): string {
        const len = this.view.getUint16(this.offset, true);
        this.offset += 2;
        const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, len);
        this.offset += len;
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }

    remaining(): number {
        return this.view.byteLength - this.offset;
    }
}
