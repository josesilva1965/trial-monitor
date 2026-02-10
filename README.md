# Trial Monitor 📊

A modern, glassmorphism-styled dashboard to track your subscriptions, trial periods, and monthly expenses.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Installed on your computer.
- **Git**: Installed for version control.

### Installation
If you haven't already:
1.  Clone the repository:
    ```bash
    git clone https://github.com/josesilva1965/trial-monitor.git
    ```
2.  Navigate to the folder:
    ```bash
    cd trial-monitor
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

---

## 🖥️ How to Run the App

### Option 1: Desktop Shortcut (Recommended)
1.  Double-click the **Trial Monitor** shortcut on your Desktop.
2.  Or double-click **`run.bat`** in the project folder.
3.  **Behavior**:
    - A dedicated app window opens (no browser tabs).
    - The background server starts minimized (invisible).
    - **To Exit**: Just close the app window. The server shuts down automatically.

### Option 2: Manual Start
If you prefer the command line:
```bash
npm run dev
```
Then open `http://localhost:5173` in your browser.

---

## ✨ Features

### 1. Dashboard Stats
See a quick summary at the top:
- **Total Monthly Cost**: Calculated based on your active trials and their currencies.
- **Active Trials**: Number of ongoing subscriptions.
- **Expiring Soon**: Count of trials ending within 3 days.

### 2. Price & Currency
When adding a trial, you can now specify:
- **Monthly Cost**
- **Currency** (USD, EUR, GBP, BRL)

### 3. Notifications 🔔
The app proactively alerts you about expiring trials.
- **Browser Alerts**: System popups (enable in Settings).
- **Email Alerts**: Receive emails via EmailJS (configure keys in Settings).

### 4. App Mode
- The app runs in a clean, borderless window.
- Use the **Exit App** button in the sidebar to close it cleanly.

---

## ☁️ GitHub Instructions

### Saving Your Changes
When you make changes to the code or add new features, save them to GitHub:

1.  **Stage changes**:
    ```bash
    git add .
    ```
2.  **Commit** (save locally):
    ```bash
    git commit -m "Description of what you changed"
    ```
3.  **Push** (upload to cloud):
    ```bash
    git push
    ```

### Pulling Updates
If you made changes on another computer:
```bash
git pull
```

---

## 🛠️ Troubleshooting

- **"Connection Refused"**: The launcher automatically waits for the server to be ready. If it happens, just wait a few seconds longer.
- **App won't close**: Click inside the background command window (if visible) and press **ENTER**.
