export enum OpCode {
    LOGIN = 0x10,
    MOVE = 0x20,
    SAY = 0x30,
    UPDATE_STATS = 0x60, // Stats Update
    DAMAGE = 0x70 // Client reports damage (authoritative for now)
}

export class Packet {
    private buffer: Uint8Array;
    private view: DataView;
    private readPos: number = 0;
    private writePos: number = 0;

    constructor(sizeOrBuffer: number | Uint8Array | any = 1024) { // 'any' to handle legacy Buffer gracefully
        if (typeof sizeOrBuffer === 'number') {
            this.buffer = new Uint8Array(sizeOrBuffer);
        } else {
            // Handle Node.js Buffer or Uint8Array
            if (sizeOrBuffer.buffer) {
                this.buffer = new Uint8Array(sizeOrBuffer.buffer, sizeOrBuffer.byteOffset, sizeOrBuffer.length);
            } else {
                this.buffer = new Uint8Array(sizeOrBuffer);
            }
            this.writePos = this.buffer.length;
        }
        this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    }

    // --- Write Methods ---

    writeOpCode(op: OpCode) {
        this.writeUint8(op);
    }

    writeUint8(value: number) {
        this.ensureCapacity(1);
        this.view.setUint8(this.writePos, value);
        // console.log(`[Packet] writeUint8: ${value} at ${this.writePos}`);
        this.writePos += 1;
    }

    writeUint16(value: number) {
        this.ensureCapacity(2);
        this.view.setUint16(this.writePos, value, true); // Little Endian
        this.writePos += 2;
    }

    writeUint32(value: number) {
        this.ensureCapacity(4);
        this.view.setUint32(this.writePos, value, true); // Little Endian
        this.writePos += 4;
    }

    writeString(value: string) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(value);
        const len = encoded.length;

        this.writeUint16(len);
        this.ensureCapacity(len);

        this.buffer.set(encoded, this.writePos);
        this.writePos += len;
    }

    // --- Read Methods ---

    readOpCode(): OpCode {
        return this.readUint8() as OpCode;
    }

    readUint8(): number {
        const val = this.view.getUint8(this.readPos);
        this.readPos += 1;
        return val;
    }

    readUint16(): number {
        const val = this.view.getUint16(this.readPos, true); // Little Endian
        this.readPos += 2;
        return val;
    }

    readUint32(): number {
        const val = this.view.getUint32(this.readPos, true); // Little Endian
        this.readPos += 4;
        return val;
    }

    readString(): string {
        const len = this.readUint16();
        const decoder = new TextDecoder();
        const sub = this.buffer.subarray(this.readPos, this.readPos + len);
        const str = decoder.decode(sub);
        this.readPos += len;
        return str;
    }

    // --- Utils ---

    getBuffer(): Uint8Array { // Changed return type from Buffer to Uint8Array
        return this.buffer.subarray(0, this.writePos);
    }

    private ensureCapacity(added: number) {
        if (this.writePos + added > this.buffer.length) {
            // Double size
            const newSize = this.buffer.length * 2;
            const newBuf = new Uint8Array(newSize);
            newBuf.set(this.buffer);
            this.buffer = newBuf;
            this.view = new DataView(this.buffer.buffer);
        }
    }
}
