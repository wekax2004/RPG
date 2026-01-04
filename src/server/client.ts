import * as net from 'net';
import { GameServer } from './index.js';
import { Packet, OpCode } from './protocol.js';
import { Player } from './player.js';

export class Client {
    private buffer: Buffer = Buffer.alloc(0);
    public player: Player | null = null;

    constructor(public socket: net.Socket, public server: GameServer) {
        this.socket.on('data', (data) => this.handleData(data));
        // console.log(`[Client] Connected`);
    }

    private handleData(data: Buffer) {
        // Append new data
        this.buffer = Buffer.concat([this.buffer, data]);
        // Keep ref
        if (!this.server) return;

        // Process all complete packets
        while (this.buffer.length >= 2) {
            // Header: [Length: 2 bytes]
            const length = this.buffer.readUInt16LE(0);

            if (this.buffer.length < length + 2) {
                // Not enough data yet
                break;
            }

            // Extract packet (Body)
            const packetData = this.buffer.subarray(2, 2 + length);
            this.handlePacket(new Packet(packetData));

            // Remove processed data
            this.buffer = this.buffer.subarray(2 + length);
        }
    }

    private handlePacket(packet: Packet) {
        try {
            const op = packet.readOpCode();
            console.log(`[Client] Packet OpCode: ${op}`);

            switch (op) {
                case OpCode.LOGIN:
                    const name = packet.readString();
                    console.log(`[Client] Login Request: ${name}`);

                    // Create Player
                    const player = new Player(this);
                    player.name = name;
                    this.player = player;
                    this.server.world.addPlayer(player);

                    // Send Initial Stats
                    const stats = new Packet();
                    stats.writeOpCode(OpCode.UPDATE_STATS);
                    stats.writeUint16(player.hp);
                    stats.writeUint16(player.maxHp);
                    stats.writeUint16(player.mana);
                    stats.writeUint16(player.maxMana);
                    this.send(stats);

                    // TODO: Send Welcome Packet / Initial State
                    break;
                case OpCode.MOVE:
                    const dx = packet.readUint8() - 128; // 0..255 -> -128..127
                    const dy = packet.readUint8() - 128;

                    // Simple validation: Ensure dx/dy are -1, 0, or 1
                    // Actually, we should just clamp or validate in Player/World

                    // console.log(`[Client] Move Request: ${dx}, ${dy}`);

                    if (this.server.world) { // Should check if player exists
                        // Find this client's player? We didn't link client -> player in Client class clearly yet
                        // Optimization: Client should have a reference to its Player
                    }
                    if (this.player) {
                        this.player.move(dx, dy);
                    }
                    break;
                case OpCode.SAY:
                    let msg = packet.readString();
                    console.log(`[Client] Chat Raw: '${msg}' (Len: ${msg.length})`);

                    // Hex Dump
                    const hex = Array.from(msg).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
                    console.log(`[Client] Chat Hex: ${hex}`);

                    msg = msg.trim();
                    const cmd = msg.toLowerCase();

                    // DEBUG: Tell client what we see

                    const dbg = new Packet();
                    dbg.writeOpCode(OpCode.SAY);
                    dbg.writeString(`System: [Debug] CMD='${cmd}' Len=${cmd.length}`);
                    this.send(dbg);


                    // Magic System
                    if (cmd === 'exura' || cmd.includes('exura')) {
                        if (!this.player) {
                            const out = new Packet();
                            out.writeOpCode(OpCode.SAY);
                            out.writeString(`System: You are not logged in properly. Restart Client.`);
                            this.send(out);
                        } else if (cmd === 'exura') {
                            // Correct Spell
                            if (this.player.mana >= 20) {
                                this.player.mana -= 20;

                                if (this.player.hp < this.player.maxHp) {
                                    const oldHp = this.player.hp;
                                    this.player.hp = Math.min(this.player.hp + 20, this.player.maxHp);
                                    const healed = this.player.hp - oldHp;

                                    console.log(`[Magic] Healed ${healed}.`);
                                    const sys = new Packet();
                                    sys.writeOpCode(OpCode.SAY);
                                    sys.writeString(`System: You healed ${healed} HP.`);
                                    this.send(sys);
                                } else {
                                    const sys = new Packet();
                                    sys.writeOpCode(OpCode.SAY);
                                    sys.writeString(`System: You are already at full health.`);
                                    this.send(sys);
                                }

                                console.log(`[Magic] Cast Success. New HP: ${this.player.hp}, Mana: ${this.player.mana}`);

                                // Send Stats Update
                                const stats = new Packet();
                                stats.writeOpCode(OpCode.UPDATE_STATS);
                                stats.writeUint16(this.player.hp);
                                stats.writeUint16(this.player.maxHp);
                                stats.writeUint16(this.player.mana);
                                stats.writeUint16(this.player.maxMana);
                                this.send(stats);

                                // Broadcast the chant
                                const out = new Packet();
                                out.writeOpCode(OpCode.SAY);
                                out.writeString(`${this.player.name}: Exura`);
                                this.server.broadcast(out);
                                break;
                            } else {
                                console.log(`[Magic] Not enough mana.`);
                                // Fizzle (Visual only? Or tell user?)
                                const out = new Packet();
                                out.writeOpCode(OpCode.SAY);
                                out.writeString(`System: Not enough mana.`);
                                this.send(out);
                                break;
                            }
                        } else if (msg.toLowerCase().includes('exura') || msg.toLowerCase().includes('ecxura')) {
                            // Help the user with typos
                            const out = new Packet();
                            out.writeOpCode(OpCode.SAY);
                            out.writeString(`System: The spell is 'exura'.`);
                            this.send(out);
                        }
                    }

                    // Broadcast to all
                    // Create new Packet to send back
                    const out = new Packet();
                    out.writeOpCode(OpCode.SAY);
                    out.writeString(`${this.player ? this.player.name : 'Unknown'} [v3]: ${msg}`);
                    this.server.broadcast(out);
                    break;
                case OpCode.DAMAGE:
                    const damage = packet.readUint16();
                    if (this.player) {
                        this.player.hp = Math.max(0, this.player.hp - damage);
                        console.log(`[Combat] ${this.player.name} took ${damage} damage. HP: ${this.player.hp}/${this.player.maxHp}`);

                        // Sync back to confirm (and to other clients if we had health bars)
                        const stats = new Packet();
                        stats.writeOpCode(OpCode.UPDATE_STATS);
                        stats.writeUint16(this.player.hp);
                        stats.writeUint16(this.player.maxHp);
                        stats.writeUint16(this.player.mana);
                        stats.writeUint16(this.player.maxMana);
                        this.send(stats);

                        if (this.player.hp <= 0) {
                            const die = new Packet();
                            die.writeOpCode(OpCode.SAY);
                            die.writeString(`System: You have died.`);
                            this.send(die);
                        }
                    }
                    break;
                default:
                    console.log(`[Client] Unknown OpCode: ${op}`);
            }
        } catch (e) {
            console.error(`[Client] Error parsing packet:`, e);
        }
    }

    send(packet: Packet) {
        const data = packet.getBuffer();
        // Prepend Length
        const header = Buffer.alloc(2);
        header.writeUInt16LE(data.length);
        this.socket.write(Buffer.concat([header, data]));
    }
}
