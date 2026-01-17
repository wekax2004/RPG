export class InputHandler {
    keys: Set<string> = new Set();
    justPressedMap: Set<string> = new Set();
    mouse: { x: number, y: number } = { x: 0, y: 0 };
    screenMouse: { x: number, y: number } = { x: 0, y: 0 };
    mouseKeys: Set<number> = new Set();
    clickedOnCanvas: boolean = false;

    constructor() {
        // 1. Key Down
        window.addEventListener('keydown', (e) => {
            if (!this.keys.has(e.code)) {
                this.justPressedMap.add(e.code);
                console.log(`[Input] KeyDown: ${e.code}`); // Debug
            }
            this.keys.add(e.code);
        });

        // 2. Key Up
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            console.log(`[Input] KeyUp: ${e.code}. Remaining: ${Array.from(this.keys)}`); // Debug
        });

        // 3. Blur (Clear all)
        window.addEventListener('blur', () => {
            this.keys.clear();
            this.mouseKeys.clear();
        });

        // Mouse Support
        window.addEventListener('mousemove', (e) => {
            // Raw Logic
            this.screenMouse.x = e.clientX;
            this.screenMouse.y = e.clientY;

            const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();

            // This math handles CSS scaling and Sidebar offsets automatically
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // 3. APPLY OFFSET (Subtract Canvas Position + Border)
            // We use 'clientLeft' to account for any CSS borders on the canvas
            this.mouse.x = (e.clientX - rect.left - canvas.clientLeft) * scaleX;
            this.mouse.y = (e.clientY - rect.top - canvas.clientTop) * scaleY;
        });

        window.addEventListener('mousedown', (e) => {
            const canvas = document.getElementById('gameCanvas');
            this.clickedOnCanvas = e.target === canvas || (canvas && canvas.contains(e.target as Node));

            this.mouseKeys.add(e.button);
            if (e.button === 0) {
                if (!this.keys.has('MouseLeft')) this.justPressedMap.add('MouseLeft');
                this.keys.add('MouseLeft');
            }
            if (e.button === 2) {
                if (!this.keys.has('MouseRight')) this.justPressedMap.add('MouseRight');
                this.keys.add('MouseRight');
            }
        });

        window.addEventListener('mouseup', (e) => {
            this.mouseKeys.delete(e.button);
            if (e.button === 0) {
                this.keys.delete('MouseLeft');
            }
            if (e.button === 2) {
                this.keys.delete('MouseRight');
            }
        });

        // 4. Prevent Context Menu
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    isDown(code: string): boolean {
        return this.keys.has(code);
    }

    isJustPressed(code: string): boolean {
        return this.justPressedMap.has(code);
    }

    getDirection(): { x: number, y: number } {
        let dx = 0;
        let dy = 0;
        if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) dy = -1;
        if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) dy = 1;
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) dx = -1;
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) dx = 1;
        return { x: dx, y: dy };
    }

    update() {
        this.justPressedMap.clear();
    }

    private shouldIgnoreInput(): boolean {
        const tag = document.activeElement?.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA';
    }

    getMouseWorldCoordinates(camera: { x: number, y: number }): { x: number, y: number } {
        // Add Camera Offset
        const worldX = this.mouse.x + camera.x;
        const worldY = this.mouse.y + camera.y;

        // Convert to Grid (Divide by 32 and Floor)
        return {
            x: Math.floor(worldX / 32),
            y: Math.floor(worldY / 32)
        };
    }
}

export type Entity = number;

export abstract class Component { }

export class World {
    private nextEntityId = 0;
    // Map<ComponentClassName, Map<EntityId, ComponentInstance>>
    private components = new Map<string, Map<Entity, any>>();
    entities: Set<Entity> = new Set();

    createEntity(): Entity {
        const id = this.nextEntityId++;
        this.entities.add(id);
        return id;
    }

    removeEntity(entity: Entity) {
        this.entities.delete(entity);
        for (const [key, map] of this.components) {
            map.delete(entity);
        }
    }

    addComponent<T>(entity: Entity, component: T) {
        const typeName = (component as any).constructor.name;
        if (!this.components.has(typeName)) {
            this.components.set(typeName, new Map());
        }
        this.components.get(typeName)!.set(entity, component);
    }

    removeComponent<T>(entity: Entity, type: { new(...args: any[]): T }) {
        const typeName = type.name;
        if (this.components.has(typeName)) {
            this.components.get(typeName)!.delete(entity);
        }
    }

    getComponent<T>(entity: Entity, type: { new(...args: any[]): T }): T | undefined {
        return this.components.get(type.name)?.get(entity);
    }

    // Returns entities that have ALL the specified component types
    query(types: Function[]): Entity[] {
        const result: Entity[] = [];
        for (const entity of this.entities) {
            const hasAll = types.every(t => this.components.get(t.name)?.has(entity));
            if (hasAll) result.push(entity);
        }
        return result;
    }
}
