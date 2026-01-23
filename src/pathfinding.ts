/**
 * A* Pathfinding for Monster AI
 * 
 * Provides smart navigation around obstacles
 */

import { TileMap, Tile } from './components';
import { PHYSICS } from './physics';
import { BLOCKING_IDS } from './movement';

// Point type for path coordinates (tile coords)
export interface PathPoint {
    x: number;
    y: number;
}

// Node used in A* algorithm
interface PathNode {
    x: number;
    y: number;
    g: number;  // Cost from start
    h: number;  // Heuristic (estimated cost to goal)
    f: number;  // Total cost (g + h)
    parent: PathNode | null;
}

// Configuration
const MAX_PATH_LENGTH = 20;  // Max tiles to search
const DIAGONAL_COST = 1.414; // sqrt(2) for diagonal movement
const CARDINAL_COST = 1;

/**
 * Check if a tile is walkable for pathfinding
 */
export function isTileWalkableForAI(map: TileMap, x: number, y: number): boolean {
    const tile = map.getTile(x, y);
    if (!tile) return false;

    // Check for blocking items
    return !tile.items.some(item =>
        BLOCKING_IDS.has(item.id) || PHYSICS.isSolid(item.id)
    );
}

/**
 * Heuristic: Chebyshev distance (allows diagonal movement)
 */
function heuristic(ax: number, ay: number, bx: number, by: number): number {
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    // Chebyshev distance with slight preference for cardinal
    return Math.max(dx, dy) + (Math.min(dx, dy) * 0.001);
}

/**
 * Get node key for storage in maps
 */
function nodeKey(x: number, y: number): string {
    return `${x},${y}`;
}

/**
 * 8-directional neighbors (N, S, E, W, NE, NW, SE, SW)
 */
const DIRECTIONS = [
    { dx: 0, dy: -1, cost: CARDINAL_COST },   // North
    { dx: 0, dy: 1, cost: CARDINAL_COST },    // South
    { dx: 1, dy: 0, cost: CARDINAL_COST },    // East
    { dx: -1, dy: 0, cost: CARDINAL_COST },   // West
    { dx: 1, dy: -1, cost: DIAGONAL_COST },   // NE
    { dx: -1, dy: -1, cost: DIAGONAL_COST },  // NW
    { dx: 1, dy: 1, cost: DIAGONAL_COST },    // SE
    { dx: -1, dy: 1, cost: DIAGONAL_COST },   // SW
];

/**
 * Find path from start to goal using A*
 * 
 * @param startX Start X in tile coords
 * @param startY Start Y in tile coords
 * @param goalX Goal X in tile coords
 * @param goalY Goal Y in tile coords
 * @param map The tile map
 * @returns Array of points from start to goal (excluding start), or empty if no path
 */
export function findPath(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number,
    map: TileMap
): PathPoint[] {
    // Floor to tile coords
    startX = Math.floor(startX);
    startY = Math.floor(startY);
    goalX = Math.floor(goalX);
    goalY = Math.floor(goalY);

    // Already at goal
    if (startX === goalX && startY === goalY) {
        return [];
    }

    // Goal is blocked (but we want to get adjacent)
    // We'll path to an adjacent tile instead
    let actualGoalX = goalX;
    let actualGoalY = goalY;

    if (!isTileWalkableForAI(map, goalX, goalY)) {
        // Find nearest walkable tile adjacent to goal
        let found = false;
        for (const dir of DIRECTIONS) {
            const nx = goalX + dir.dx;
            const ny = goalY + dir.dy;
            if (isTileWalkableForAI(map, nx, ny)) {
                actualGoalX = nx;
                actualGoalY = ny;
                found = true;
                break;
            }
        }
        if (!found) {
            return []; // No reachable path
        }
    }

    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();
    const gScores = new Map<string, number>();

    const startNode: PathNode = {
        x: startX,
        y: startY,
        g: 0,
        h: heuristic(startX, startY, actualGoalX, actualGoalY),
        f: 0,
        parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);
    gScores.set(nodeKey(startX, startY), 0);

    let iterations = 0;
    const maxIterations = MAX_PATH_LENGTH * MAX_PATH_LENGTH * 4;

    while (openSet.length > 0 && iterations < maxIterations) {
        iterations++;

        // Find node with lowest f score
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
        const currentKey = nodeKey(current.x, current.y);

        // Reached goal?
        if (current.x === actualGoalX && current.y === actualGoalY) {
            // Reconstruct path
            const path: PathPoint[] = [];
            let node: PathNode | null = current;
            while (node && node.parent) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            return path;
        }

        closedSet.add(currentKey);

        // Check if we're getting too far from start
        if (current.g > MAX_PATH_LENGTH) {
            continue;
        }

        // Explore neighbors
        for (const dir of DIRECTIONS) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            const neighborKey = nodeKey(nx, ny);

            // Skip if already evaluated
            if (closedSet.has(neighborKey)) continue;

            // Skip if not walkable
            if (!isTileWalkableForAI(map, nx, ny)) continue;

            // For diagonal movement, check that both cardinal neighbors are walkable
            // This prevents cutting corners through walls
            if (dir.dx !== 0 && dir.dy !== 0) {
                if (!isTileWalkableForAI(map, current.x + dir.dx, current.y) ||
                    !isTileWalkableForAI(map, current.x, current.y + dir.dy)) {
                    continue;
                }
            }

            const tentativeG = current.g + dir.cost;

            // Check if this is a better path
            const previousG = gScores.get(neighborKey);
            if (previousG !== undefined && tentativeG >= previousG) {
                continue;
            }

            // This is a better path
            const neighbor: PathNode = {
                x: nx,
                y: ny,
                g: tentativeG,
                h: heuristic(nx, ny, actualGoalX, actualGoalY),
                f: 0,
                parent: current
            };
            neighbor.f = neighbor.g + neighbor.h;

            gScores.set(neighborKey, tentativeG);

            // Add to open set if not already there
            const existingIdx = openSet.findIndex(n => n.x === nx && n.y === ny);
            if (existingIdx >= 0) {
                openSet[existingIdx] = neighbor;
            } else {
                openSet.push(neighbor);
            }
        }
    }

    // No path found
    return [];
}

/**
 * Get the next step towards a target, using cached path when possible
 * 
 * @param monsterTileX Monster X in tile coords
 * @param monsterTileY Monster Y in tile coords
 * @param targetTileX Target X in tile coords
 * @param targetTileY Target Y in tile coords
 * @param map The tile map
 * @param cachedPath Optional cached path from previous calculation
 * @returns Object with next tile to move to and updated path cache
 */
export function getNextStep(
    monsterTileX: number,
    monsterTileY: number,
    targetTileX: number,
    targetTileY: number,
    map: TileMap,
    cachedPath?: PathPoint[],
    cachedTargetX?: number,
    cachedTargetY?: number
): { nextX: number; nextY: number; newPath: PathPoint[]; pathValid: boolean } {
    // Floor positions
    monsterTileX = Math.floor(monsterTileX);
    monsterTileY = Math.floor(monsterTileY);
    targetTileX = Math.floor(targetTileX);
    targetTileY = Math.floor(targetTileY);

    // Check if cached path is still valid
    if (cachedPath && cachedPath.length > 0 &&
        cachedTargetX === targetTileX && cachedTargetY === targetTileY) {

        // Check if we're on the path
        const nextPoint = cachedPath[0];
        const dx = Math.abs(nextPoint.x - monsterTileX);
        const dy = Math.abs(nextPoint.y - monsterTileY);

        // If next point is adjacent, use it
        if (dx <= 1 && dy <= 1) {
            // Check if tile is still walkable
            if (isTileWalkableForAI(map, nextPoint.x, nextPoint.y)) {
                const remaining = cachedPath.slice(1);
                return {
                    nextX: nextPoint.x,
                    nextY: nextPoint.y,
                    newPath: remaining,
                    pathValid: true
                };
            }
        }
    }

    // Need to recalculate path
    const path = findPath(monsterTileX, monsterTileY, targetTileX, targetTileY, map);

    if (path.length === 0) {
        // No path found - fallback to direct movement
        let dx = 0;
        let dy = 0;
        if (monsterTileX < targetTileX) dx = 1;
        else if (monsterTileX > targetTileX) dx = -1;
        if (monsterTileY < targetTileY) dy = 1;
        else if (monsterTileY > targetTileY) dy = -1;

        // Try direct movement
        const nextX = monsterTileX + dx;
        const nextY = monsterTileY + dy;

        if (isTileWalkableForAI(map, nextX, nextY)) {
            return { nextX, nextY, newPath: [], pathValid: false };
        }

        // Try cardinal only
        if (dx !== 0 && isTileWalkableForAI(map, monsterTileX + dx, monsterTileY)) {
            return { nextX: monsterTileX + dx, nextY: monsterTileY, newPath: [], pathValid: false };
        }
        if (dy !== 0 && isTileWalkableForAI(map, monsterTileX, monsterTileY + dy)) {
            return { nextX: monsterTileX, nextY: monsterTileY + dy, newPath: [], pathValid: false };
        }

        // Completely stuck
        return { nextX: monsterTileX, nextY: monsterTileY, newPath: [], pathValid: false };
    }

    // Use first step of new path
    const nextPoint = path[0];
    return {
        nextX: nextPoint.x,
        nextY: nextPoint.y,
        newPath: path.slice(1),
        pathValid: true
    };
}
