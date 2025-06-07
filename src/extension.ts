import * as vscode from 'vscode';
import { RetypeMode } from './retypeMode';
import { registerCommands } from './commands';
import { StatsTracker } from './statsTracker';

let retypeMode: RetypeMode | undefined;
let statsTracker: StatsTracker | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('ReType extension is now active!');

    // Initialize core components
    statsTracker = new StatsTracker();
    retypeMode = new RetypeMode(context, statsTracker);

    // Register all commands
    registerCommands(context, retypeMode);

    // Add status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);

    // Update status bar when active
    const updateStatusBar = () => {
        if (retypeMode?.isActive()) {
            const stats = statsTracker?.getCurrentStats();
            statusBarItem.text = `$(keyboard) ReType: ${stats?.wpm || 0} WPM | ${stats?.accuracy || 100}% | ${stats?.errors || 0} errors`;
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    };

    // Listen for typing mode changes
    retypeMode.onModeChanged(updateStatusBar);
    
    // Update status bar periodically during active sessions
    setInterval(updateStatusBar, 1000);
}

export function deactivate() {
    if (retypeMode) {
        retypeMode.dispose();
        retypeMode = undefined;
    }
    if (statsTracker) {
        statsTracker.dispose();
        statsTracker = undefined;
    }
} 