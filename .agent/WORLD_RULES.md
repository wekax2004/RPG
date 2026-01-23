# 🌍 WORLD_RULES.md (Master Project Context)

## 1. ENGINE & COORDINATE SYSTEM

* **Language:** TypeScript
* **Grid:** 2D Tile Grid. `x, y` represent grid coordinates.
* **Tile Size:** 32x32 pixels.
* **Z-Axis (Fake 3D):**
  * Standard tiles (Floors) are 32x32.
  * **Tall Objects (Walls/Trees):** Must use `height > 32`. The renderer automatically shifts them UP (`yOffset = height - 32`) to create a 3D perspective. Never scale tall objects down to 32x32.

---

## 2. SPRITE HANDLING (`edron_v2.png`)

* **Source File:** `/sprites/edron_v2.png` (Dimensions: 512x512).
* **Background Color:** Magenta (`#FF00FF`).
* **The "Purple Line" Fix:** All sprite cuts must shave off edges to prevent background bleeding.
  * **Rule:** Add `+2` to X and Y. Subtract `-4` from Width and Height.
  * *Example:* Instead of `x:0, y:0, w:32, h:32`, use `x:2, y:2, w:28, h:28`.

* **Wall Logic:**
  * **Vertical Walls:** Must be cut as **Tall Pillars** (e.g., 32x100px).
  * **Horizontal Walls:** Must be cut as **Seamless Slices** (32px wide) to connect perfectly.

---

## 3. WORLD GENERATION LOGIC

* **Terrain Style:** Use **Perlin Noise** (smooth gradients) for biomes, NOT random noise.
  * *High Noise (> 0.5):* Mountains/Cliffs (ID 6020).
  * *Mid Noise (0.0):* Grass (ID 6012).
  * *Low Noise (< -0.5):* Water or Dirt Paths (ID 6013).

* **The Castle Rule:** The Center Zone (approx 50x50) is reserved for the Player Castle.
  * **Castle Interior:** Cobblestone (6010).
  * **Castle Walls:** Perimeter must use Wall IDs 6000/6001.

---

## 4. ENTITY & MOB SPAWNING

* **Zone 1 (Inside Castle):** `King Tibianus` (Throne Room), `Royal Guard` (Gate).
* **Zone 2 (Near Walls):** `Rat` (Pests), `Spider`.
* **Zone 3 (Wilderness/Forest):** `Wolf`, `Bear`, `Bandit`.
* **Zone 4 (Deep Mountains):** `Cyclops`, `Dragon`, `Orc`.

---

## 5. SPRITE ID RANGES

| Range | Purpose |
|-------|---------|
| **6000-6009** | Walls & Doors (Structural) |
| **6010-6019** | Floors (Ground) |
| **6020-6029** | Nature/Mountains (Cliffs) |
| **6030-6039** | Decor (Lamps, Barrels) |
| **6100+** | Mobs/NPCs |

---

## 6. MULTI-FLOOR SYSTEM (WorldMap3D)

* **GROUND_FLOOR = 7**, Elevated City = 6.
* **Sync Rule:** When generating terrain or structures, set tiles on **BOTH floors** if the player can access either.
* **Collision Sync:** Gate openings and paths must clear collision flags (`isWall: false`, `items = []`) on **BOTH** the city floor (Z=6) AND ground floor (Z=7) to prevent invisible blocking.

---

## 7. PATH CLEARING CHECKLIST

For ANY walkable path (gates, roads, entrances), the generator MUST:

1. Clear `tile.items = []` (remove wall sprites).
2. Remove from `wallIndices` set (remove collision).
3. Set floor tile (e.g., `6013` dirt or `6010` cobblestone).
4. **Crucial:** Do this on ALL relevant Z-levels (6 and 7).

---

## 8. EDRON_V2.PNG GRID REFERENCE (512x512)

| Row | Y Range | Contents |
|-----|---------|----------|
| **Row 0** | y:0-127 | Walls (Vertical, Horizontal, Pillar, Door) |
| **Row 1** | y:128-255 | Floors (Cobblestone, Pavement, Grass, Dirt) |
| **Row 2** | y:256-383 | Mountains (Cliff variations, Stairs) |
| **Row 3** | y:384-511 | Decor (Lamp, Barrel, Crate, Flower) |
