# QA Instructions - Sewer Expansion & Cross-Floor Fixes

**Branch:** `main` (Latest)
**Date:** 2026-01-23

## 1. Installation & Setup

1.  **Clone/Pull Repository**:
    ```bash
    git pull origin main
    ```
2.  **Install Dependencies** (if new):
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Open Game**:
    -   Navigate to `http://localhost:5173` (or port shown in terminal).
    -   Click "New Game" or "Load Game".

---

## 2. Feature Verification: Sewer Expansion

**Goal**: Verify the new procedural dungeon and boss.

1.  **Enter Sewers**:
    -   Start in **Edron City** (Town Center).
    -   Walk to the **Sewer Grate** (center of town square).
    -   Right-click (or 'Use') the grate to enter.

2.  **Explore Dungeon**:
    -   **Expect**: You should NOT see just one room. You should see a starting room with a ladder, connected to tunnels and other rooms.
    -   **Mobs**: You should encounter **Rats** and **Slimes**.
    -   **Wall/Floor**: Check for "White Z" artifacts. The floor should be "Cobblestone" (Grey/Greenish).

3.  **Find the Boss**:
    -   Navigate to the deepest/last room of the dungeon (it might be a bit of a maze).
    -   **Expect**: Find a **"Big Zombie"** (Mini Boss).
    -   **Combat**: Verify he hits harder than normal zombies and slimes.
    -   **Kill Him**: Verify he drops loot (check log or ground).

---

## 3. Bug Fix Verification: Cross-Floor "Ghost Attacks"

**Goal**: Ensure mobs on different floors cannot attack or be attacked.

1.  **Town Safety Test**:
    -   Go to **Town Center (Z=6)**.
    -   Stand near the Sewer Grate.
    -   **Action**: Wait for 10-20 seconds.
    -   **Expected**: You should **NOT** take damage from Rats below. You should **NOT** see damage numbers popping up from the ground.

2.  **Sewer Combat Test**:
    -   Go down into the **Sewer (Z=7)**.
    -   Find a Rat/Slime. Let it attack you.
    -   **Action**: Go up the ladder back to Town (Z=6).
    -   **Expected**: The Rat should **STOP** attacking you immediately. You should not take damage while in town.

3.  **Targeting Test**:
    -   Stand in Town (Z=6).
    -   Right-click on the ground where you know a Rat is below (e.g. near the grate start point).
    -   **Expected**: You should **NOT** be able to target the Rat (Red Box/Name shouldn't appear).

---

## 4. Visual Verification

1.  **Damage Numbers**:
    -   Cast a spell (e.g. `exura`) or take damage.
    -   **Expect**: Floating text should appear.
    -   **Action**: Change floors (Ladder).
    -   **Expect**: Floating text from the previous floor should **NOT** be visible on the new floor.

2.  **Blood Splatters**:
    -   Kill a mob. Blood appears.
    -   Change floors.
    -   **Expect**: Blood from Z=7 should not be visible on Z=6.
