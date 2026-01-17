
export class NPC {
    constructor(
        public type: 'merchant' | 'healer' | 'guide',
        public dialog: string[]
    ) { }
}
