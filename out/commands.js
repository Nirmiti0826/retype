"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode = require("vscode");
function registerCommands(context, retypeMode) {
    // Start Practice Mode command
    const startPracticeCommand = vscode.commands.registerCommand('retype.startPractice', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('ReType: Please open a file to start practice mode');
            return;
        }
        if (retypeMode.isActive()) {
            vscode.window.showInformationMessage('ReType: Practice mode is already active');
            return;
        }
        try {
            await retypeMode.startPractice(activeEditor);
            vscode.window.showInformationMessage('ReType: Practice mode started! Start typing to begin.');
        }
        catch (error) {
            vscode.window.showErrorMessage(`ReType: Failed to start practice mode: ${error}`);
        }
    });
    // Stop Practice Mode command
    const stopPracticeCommand = vscode.commands.registerCommand('retype.stopPractice', () => {
        if (!retypeMode.isActive()) {
            vscode.window.showWarningMessage('ReType: Practice mode is not active');
            return;
        }
        retypeMode.stopPractice();
        vscode.window.showInformationMessage('ReType: Practice mode stopped');
    });
    // Reset Session command
    const resetSessionCommand = vscode.commands.registerCommand('retype.resetSession', () => {
        if (!retypeMode.isActive()) {
            vscode.window.showWarningMessage('ReType: No active practice session to reset');
            return;
        }
        retypeMode.resetSession();
        vscode.window.showInformationMessage('ReType: Session reset');
    });
    // Register all commands
    context.subscriptions.push(startPracticeCommand, stopPracticeCommand, resetSessionCommand);
}
exports.registerCommands = registerCommands;
//# sourceMappingURL=commands.js.map