export var OpCode;
(function (OpCode) {
    OpCode[OpCode["LOGIN"] = 16] = "LOGIN";
    OpCode[OpCode["MOVE"] = 32] = "MOVE";
    OpCode[OpCode["SAY"] = 48] = "SAY";
    OpCode[OpCode["UPDATE_STATS"] = 96] = "UPDATE_STATS";
    OpCode[OpCode["DAMAGE"] = 112] = "DAMAGE"; // Client reports damage (authoritative for now)
})(OpCode || (OpCode = {}));
export class Packet {
    constructor(sizeOrBuffer = 1024) {
        Object.defineProperty(this, "buffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "readPos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "writePos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        if (typeof sizeOrBuffer === 'number') {
            this.buffer = new Uint8Array(sizeOrBuffer);
        }
        else {
            // Handle Node.js Buffer or Uint8Array
            if (sizeOrBuffer.buffer) {
                this.buffer = new Uint8Array(sizeOrBuffer.buffer, sizeOrBuffer.byteOffset, sizeOrBuffer.length);
            }
            else {
                this.buffer = new Uint8Array(sizeOrBuffer);
            }
            this.writePos = this.buffer.length;
        }
        this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    }
    // --- Write Methods ---
    writeOpCode(op) {
        this.writeUint8(op);
    }
    writeUint8(value) {
        this.ensureCapacity(1);
        this.view.setUint8(this.writePos, value);
        // console.log(`[Packet] writeUint8: ${value} at ${this.writePos}`);
        this.writePos += 1;
    }
    writeUint16(value) {
        this.ensureCapacity(2);
        this.view.setUint16(this.writePos, value, true); // Little Endian
        this.writePos += 2;
    }
    writeUint32(value) {
        this.ensureCapacity(4);
        this.view.setUint32(this.writePos, value, true); // Little Endian
        this.writePos += 4;
    }
    writeString(value) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(value);
        const len = encoded.length;
        this.writeUint16(len);
        this.ensureCapacity(len);
        this.buffer.set(encoded, this.writePos);
        this.writePos += len;
    }
    // --- Read Methods ---
    readOpCode() {
        return this.readUint8();
    }
    readUint8() {
        const val = this.view.getUint8(this.readPos);
        this.readPos += 1;
        return val;
    }
    readUint16() {
        const val = this.view.getUint16(this.readPos, true); // Little Endian
        this.readPos += 2;
        return val;
    }
    readUint32() {
        const val = this.view.getUint32(this.readPos, true); // Little Endian
        this.readPos += 4;
        return val;
    }
    readString() {
        const len = this.readUint16();
        const decoder = new TextDecoder();
        const sub = this.buffer.subarray(this.readPos, this.readPos + len);
        const str = decoder.decode(sub);
        this.readPos += len;
        return str;
    }
    // --- Utils ---
    getBuffer() {
        return this.buffer.subarray(0, this.writePos);
    }
    ensureCapacity(added) {
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
