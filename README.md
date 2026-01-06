# Retro MMORPG ⚔️

A multiplayer retro-style RPG built with TypeScript, Electron, and pure creativity.

## 🚀 How to Play (Source Code)

If you downloaded the code (via Git or ZIP), follow these steps to play.

### 1. Install Node.js
You need **Node.js** to run the game engine.
[Download Node.js Here](https://nodejs.org/) (LTS Version is best).

### 2. Setup
Open your terminal (Command Prompt) in this folder and run:
```bash
npm install
```

### 3. Play! (Client)
To start the game:
```bash
npm run start:client
```
*(This launches the Game Client + A local server automatically).*

---

## 🌍 Multiplayer

Want to play with friends?

### Hosting a Server
If **YOU** want to be the host:
1.  Run the dedicated server:
    ```bash
    npm run start:server
    ```
2.  Share your IP address (or use a tunnel like [Playit.gg](https://playit.gg) or [Ngrok](https://ngrok.com) to forward port `3000`).

### Joining a Server
If you want to **JOIN** a friend:
1.  Go to `desktop-app/` folder.
2.  Copy `server_config.example.json` and rename it to `server_config.json`.
3.  Edit `server_config.json` with your friend's IP:
    ```json
    {
        "host": "FRIENDS_IP_OR_URL",
        "port": 3000
    }
    ```
4.  Run `npm run start:client`.

---

## 🎮 Controls

*   **WASD / Arrow Keys**: Move
*   **Mouse Left-Click**: Attack / Interact
*   **Mouse Right-Click**: Loot Corpse
*   **Enter**: Chat
*   **I / B**: Inventory / Bag
*   **P**: Toggle PvP
*   **Ctrl+R**: Reload (Fixes glitches)

### Class Skills 🌟
*   **Knight**: `/exori mas` (Whirlwind)
*   **Mage**: `/exevo vis` (Energy Beam)
*   **Ranger**: `/utito san` (Sniper Shot)

Have fun!
