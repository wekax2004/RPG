
import { Entity } from './core/entity';
import { Position, Sprite, Name, Tint } from './components';

export class NPC {
    constructor(
        public type: 'merchant' | 'healer' | 'guide',
        public dialog: string[]
    ) { }
}
