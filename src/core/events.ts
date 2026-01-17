export type EventCallback = (data?: any) => void;

class EventEmitter {
    private listeners: Map<string, Set<EventCallback>> = new Map();

    on(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: EventCallback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.delete(callback);
        }
    }

    emit(event: string, data?: any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach(callback => callback(data));
        }
    }
}

export const gameEvents = new EventEmitter();

// Defined Event Constants
export const EVENTS = {
    PLAYER_STATS_CHANGED: 'PLAYER_STATS_CHANGED',
    INVENTORY_CHANGED: 'INVENTORY_CHANGED',
    TARGET_CHANGED: 'TARGET_CHANGED',
    BATTLE_LIST_UPDATED: 'BATTLE_LIST_UPDATED',
    SYSTEM_MESSAGE: 'SYSTEM_MESSAGE',
    PLAYER_ACTION: 'PLAYER_ACTION',
    TARGET_ENTITY: 'TARGET_ENTITY',
    SHOP_BUY: 'SHOP_BUY'
};
