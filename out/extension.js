"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const retypeMode_1 = require("./retypeMode");
const commands_1 = require("./commands");
const statsTracker_1 = require("./statsTracker");
let retypeMode;
let statsTracker;
function activate(context) {
    console.log('ReType extension is now active!');
    // Initialize core components
    statsTracker = new statsTracker_1.StatsTracker();
    retypeMode = new retypeMode_1.RetypeMode(context, statsTracker);
    // Register all commands
    (0, commands_1.registerCommands)(context, retypeMode);
    // Add status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);
    // Update status bar when active
    const updateStatusBar = () => {
        if (retypeMode?.isActive()) {
            const stats = statsTracker?.getCurrentStats();
            statusBarItem.text = `$(keyboard) ReType: ${stats?.wpm || 0} WPM | ${stats?.accuracy || 100}% | ${stats?.errors || 0} errors`;
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    };
    // Listen for typing mode changes
    retypeMode.onModeChanged(updateStatusBar);
    // Update status bar periodically during active sessions
    setInterval(updateStatusBar, 1000);
}
exports.activate = activate;
function deactivate() {
    if (retypeMode) {
        retypeMode.dispose();
        retypeMode = undefined;
    }
    if (statsTracker) {
        statsTracker.dispose();
        statsTracker = undefined;
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map