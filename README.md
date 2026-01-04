# Retro RPG

## How to Run for QA

Since this is the source code, you will need `Node.js` installed.

1.  **Download/Clone** this repository.
2.  Open a terminal in this folder.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Start the Game**:
    ```bash
    npm run dev
    ```
    This will open the game in your browser (usually at `http://localhost:5173`).

## Building for Release
To create the `.zip` or `.exe` build:
```bash
npm run build
```
The output will be in the `dist/` or `release/` folder.
