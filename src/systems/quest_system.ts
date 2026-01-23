import { World } from '../engine';
import { gameEvents, EVENTS } from '../core/events';
import { Quest, QuestLog, Inventory, Position } from '../components';
import { QUEST_REGISTRY } from '../data/quests';

export class QuestSystem {
    constructor(private world: World) {
        this.setupHooks();
    }

    setupHooks() {
        // KILL Handler
        gameEvents.on(EVENTS.TARGET_ENTITY, (entityId: number) => {
            // This is target SELECTION, not death. 
            // We need a specific death event.
            // Assuming we'll add 'MOB_KILLED' event.
        });

        // We need a custom event for death
        gameEvents.on('MOB_KILLED', (mobName: string) => {
            this.checkKillObj(mobName);
        });

        // FETCH / INVENTORY Handler
        gameEvents.on(EVENTS.INVENTORY_CHANGED, (inv: Inventory) => {
            this.checkFetchObj(inv);
        });

        // EXPLORE Handler (Zone Enter)
        gameEvents.on('ZONE_ENTER', (zoneId: string) => {
            this.checkExploreObj(zoneId);
        });

        // USE Item Handler
        gameEvents.on('ITEM_USED', (itemName: string) => {
            console.log(`[Quest] Item Used: ${itemName}`);
            this.checkUseObj(itemName);
        });
    }

    private getPlayerQuestLog(): QuestLog | null {
        // Assuming single player for now or querying player entity
        // We find the Entity with QuestLog (Player)
        const entities = this.world.query([QuestLog]);
        if (entities.length === 0) return null;
        return this.world.getComponent(entities[0], QuestLog)!;
    }

    private checkKillObj(mobName: string) {
        const qLog = this.getPlayerQuestLog();
        if (!qLog) return;

        for (const quest of qLog.quests) {
            if (!quest.completed && quest.type === 'KILL' && quest.targetId === mobName) {
                quest.current++;
                this.notifyUpdate(quest);
                if (quest.current >= quest.targetCount) {
                    this.completeQuest(quest);
                }
            }
        }
    }

    private checkFetchObj(inv: Inventory) {
        const qLog = this.getPlayerQuestLog();
        if (!qLog) return;

        for (const quest of qLog.quests) {
            if (!quest.completed && quest.type === 'FETCH') {
                if (inv.hasItem(quest.targetId)) {
                    quest.current = 1; // Or count items?
                    // For 'Fetch', usually we just need to HAVE it.
                    // Or do we need to turn it in? 
                    // Let's mark complete if they have it, OR just update progress.
                    // The prompt says "If player has item, mark Complete".
                    this.completeQuest(quest);
                }
            }
        }
    }

    private checkExploreObj(zoneId: string) {
        const qLog = this.getPlayerQuestLog();
        if (!qLog) return;

        for (const quest of qLog.quests) {
            if (!quest.completed && quest.type === 'EXPLORE' && quest.targetId === zoneId) {
                this.completeQuest(quest);
            }
        }
    }

    private checkUseObj(itemName: string) {
        const qLog = this.getPlayerQuestLog();
        if (!qLog) return;

        for (const quest of qLog.quests) {
            if (!quest.completed && quest.type === 'USE' && quest.targetId === itemName) {
                this.completeQuest(quest);
                // Special Logic for "The Clue" -> Auto-start "Finding Grom"
                if (quest.id === 'q_the_clue') {
                    this.autoStartQuest(qLog, 'q_finding_grom');
                }
            }
        }
    }

    private notifyUpdate(quest: Quest) {
        gameEvents.emit(EVENTS.SYSTEM_MESSAGE, `Quest Updated: ${quest.name} (${quest.current}/${quest.targetCount})`);
        // Toast logic could go here
    }

    private completeQuest(quest: Quest) {
        if (quest.completed) return;
        quest.completed = true;
        gameEvents.emit(EVENTS.SYSTEM_MESSAGE, `Quest Complete: ${quest.name}!`);
        // Toast Notification (Golden)
        // triggerToast(quest.name, 'COMPLETE'); // defined elsewhere?
    }

    private autoStartQuest(qLog: QuestLog, questId: string) {
        const tpl = QUEST_REGISTRY[questId];
        if (tpl && !qLog.quests.find(q => q.id === questId)) {
            const newQuest = { ...tpl, current: 0, completed: false, turnedIn: false };
            qLog.quests.push(newQuest);
            gameEvents.emit(EVENTS.SYSTEM_MESSAGE, `New Quest: ${newQuest.name}`);
        }
    }
}

// Factory to create/init system
export function initQuestSystem(world: World) {
    return new QuestSystem(world);
}
