"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetypeMode = void 0;
const vscode = require("vscode");
const decorationManager_1 = require("./decorationManager");
class RetypeMode {
    constructor(context, statsTracker) {
        this.active = false;
        this.originalText = '';
        this.typedText = '';
        this.errors = [];
        this.currentPosition = 0; // Current position in the text being typed
        this.isReadOnly = false;
        this.context = context;
        this.statsTracker = statsTracker;
        this.decorationManager = new decorationManager_1.DecorationManager();
    }
    async startPractice(editor) {
        if (this.active) {
            throw new Error('Practice mode is already active');
        }
        this.currentEditor = editor;
        this.startPosition = editor.selection.active;
        this.active = true;
        this.typedText = '';
        this.errors = [];
        this.currentPosition = 0;
        // Get text from cursor position to end of document
        const document = editor.document;
        const startOffset = document.offsetAt(this.startPosition);
        const endOffset = document.getText().length;
        this.originalText = document.getText().substring(startOffset);
        // Make document read-only during practice
        this.isReadOnly = true;
        // Save original cursor style and set to line cursor
        this.originalCursorStyle = editor.options.cursorStyle;
        editor.options = {
            ...editor.options,
            cursorStyle: vscode.TextEditorCursorStyle.Line
        };
        // Position cursor at start of practice area
        editor.selection = new vscode.Selection(this.startPosition, this.startPosition);
        // Initialize decorations
        this.decorationManager.initializeDecorations(editor, this.startPosition);
        // Start stats tracking
        this.statsTracker.reset();
        this.statsTracker.startTracking();
        // Set up event listeners
        this.setupEventListeners();
        // Notify mode change
        if (this.modeChangedCallback) {
            this.modeChangedCallback();
        }
    }
    stopPractice() {
        if (!this.active)
            return;
        this.active = false;
        // Restore document editing
        this.isReadOnly = false;
        // Restore original cursor style
        if (this.currentEditor && this.originalCursorStyle !== undefined) {
            this.currentEditor.options = {
                ...this.currentEditor.options,
                cursorStyle: this.originalCursorStyle
            };
        }
        // Clean up decorations
        if (this.currentEditor) {
            this.decorationManager.clearDecorations(this.currentEditor);
        }
        // Stop stats tracking
        this.statsTracker.stopTracking();
        // Show session summary
        this.showSessionSummary();
        // Clean up event listeners
        this.cleanupEventListeners();
        // Reset state
        this.currentEditor = undefined;
        this.startPosition = undefined;
        this.originalText = '';
        this.typedText = '';
        this.errors = [];
        this.currentPosition = 0;
        this.originalCursorStyle = undefined;
        // Notify mode change
        if (this.modeChangedCallback) {
            this.modeChangedCallback();
        }
    }
    resetSession() {
        if (!this.active || !this.currentEditor || !this.startPosition)
            return;
        // Reset typed text and errors
        this.typedText = '';
        this.errors = [];
        this.currentPosition = 0;
        // Reset stats
        this.statsTracker.reset();
        this.statsTracker.startTracking();
        // Reset decorations
        this.decorationManager.initializeDecorations(this.currentEditor, this.startPosition);
        // Move cursor back to start position
        this.currentEditor.selection = new vscode.Selection(this.startPosition, this.startPosition);
    }
    isActive() {
        return this.active;
    }
    onModeChanged(callback) {
        this.modeChangedCallback = callback;
    }
    setupEventListeners() {
        // Register type command override to intercept typing during practice
        this.typeListener = vscode.commands.registerCommand('type', (args) => {
            if (!this.active || !this.currentEditor) {
                // If not in practice mode, execute default typing
                return vscode.commands.executeCommand('default:type', args);
            }
            // Handle typing in practice mode without modifying document
            if (args && args.text) {
                this.handleTyping(args.text);
                return; // Don't execute default typing to prevent document modification
            }
        });
        // Register with context for proper disposal
        this.context.subscriptions.push(this.typeListener);
        // Intercept tab command as well
        const tabListener = vscode.commands.registerCommand('tab', () => {
            if (!this.active || !this.currentEditor) {
                return vscode.commands.executeCommand('default:tab');
            }
            // Handle tab in practice mode
            this.handleTabInput();
            return; // Don't execute default tab to prevent document modification
        });
        this.context.subscriptions.push(tabListener);
        // Listen for selection changes to keep cursor in correct position
        this.selectionChangeListener = vscode.window.onDidChangeTextEditorSelection((event) => {
            if (!this.active || !this.currentEditor || event.textEditor !== this.currentEditor) {
                return;
            }
            this.handleSelectionChange(event);
        });
    }
    handleTyping(text) {
        if (!this.currentEditor || !this.startPosition)
            return;
        for (const character of text) {
            if (character === '\b' || character === '\x08') {
                // Handle backspace
                this.handleBackspace();
            }
            else if (character.length > 0) {
                // Handle regular character input (ensure character is not empty)
                this.handleCharacterInput(character);
            }
        }
    }
    handleTabInput() {
        if (!this.currentEditor || !this.startPosition)
            return;
        // Get editor configuration for tab settings
        const editorConfig = vscode.workspace.getConfiguration('editor', this.currentEditor.document.uri);
        const tabSize = editorConfig.get('tabSize', 4);
        const insertSpaces = editorConfig.get('insertSpaces', true);
        if (insertSpaces) {
            // Convert tab to spaces
            const spacesToAdd = tabSize - (this.currentPosition % tabSize);
            const spacesString = ' '.repeat(spacesToAdd);
            this.handleTyping(spacesString);
        }
        else {
            // Handle actual tab character
            this.handleCharacterInput('\t');
        }
    }
    handleCharacterInput(character) {
        if (!this.currentEditor || !this.startPosition)
            return;
        // Check if we've reached the end of the text
        if (this.currentPosition >= this.originalText.length) {
            return;
        }
        const expectedCharacter = this.originalText[this.currentPosition];
        // Handle whitespace equivalence (tab <-> spaces)
        const isCharacterCorrect = this.isCharacterMatch(character, expectedCharacter);
        // Record the character for stats
        this.statsTracker.recordCharacter(expectedCharacter, character, this.currentPosition);
        // Check if character is correct (including whitespace equivalence)
        if (isCharacterCorrect) {
            // Correct character - advance position
            this.currentPosition++;
            this.typedText += character;
            // Remove any existing error at this position
            this.errors = this.errors.filter(error => error.position !== this.currentPosition - 1);
            // Move cursor to next position
            this.updateCursorPosition();
            // Check if we've completed the text
            if (this.currentPosition >= this.originalText.length) {
                this.completeSession();
                return;
            }
        }
        else {
            // Incorrect character - add/update error but don't advance
            const existingErrorIndex = this.errors.findIndex(error => error.position === this.currentPosition);
            if (existingErrorIndex >= 0) {
                this.errors[existingErrorIndex].character = character;
            }
            else {
                this.errors.push({ position: this.currentPosition, character });
            }
            // Debug logging for character mismatch (can be helpful for troubleshooting)
            console.debug('ReType: Character mismatch at position', this.currentPosition, 'Expected:', JSON.stringify(expectedCharacter), 'Typed:', JSON.stringify(character), 'Expected char code:', expectedCharacter.charCodeAt(0), 'Typed char code:', character.charCodeAt(0));
        }
        // Update visual decorations
        this.updateDecorations();
    }
    isCharacterMatch(typed, expected) {
        // Direct match
        if (typed === expected) {
            return true;
        }
        // Normalize characters to handle different encodings
        const normalizedTyped = this.normalizeCharacter(typed);
        const normalizedExpected = this.normalizeCharacter(expected);
        if (normalizedTyped === normalizedExpected) {
            return true;
        }
        // Handle tab/space equivalence
        if (!this.currentEditor)
            return false;
        const editorConfig = vscode.workspace.getConfiguration('editor', this.currentEditor.document.uri);
        const tabSize = editorConfig.get('tabSize', 4);
        // If expected is tab and typed is space(s)
        if (expected === '\t' && typed === ' ') {
            // Check if we're at a position where a tab would make sense
            // For simplicity, accept space when tab is expected
            return true;
        }
        // If expected is space and typed is tab
        if (expected === ' ' && typed === '\t') {
            // Accept tab when space is expected (will be converted to appropriate spaces)
            return true;
        }
        // Handle quote equivalence (straight vs curly quotes)
        if (this.areQuotesEquivalent(typed, expected)) {
            return true;
        }
        // Handle other special character equivalence
        if (this.areSpecialCharactersEquivalent(typed, expected)) {
            return true;
        }
        return false;
    }
    normalizeCharacter(char) {
        // Normalize Unicode to handle different representations of the same character
        return char.normalize('NFC');
    }
    areQuotesEquivalent(typed, expected) {
        // Map of equivalent quote characters using Unicode escape sequences
        const quoteMap = {
            '"': ['"', '\u201C', '\u201D'],
            "'": ["'", '\u2018', '\u2019', '`'],
            '`': ['`', '\u2018'], // backtick, left single quote
        };
        // Check if typed and expected are equivalent quotes
        for (const [canonical, equivalents] of Object.entries(quoteMap)) {
            if (equivalents.includes(typed) && equivalents.includes(expected)) {
                return true;
            }
            if (canonical === typed && equivalents.includes(expected)) {
                return true;
            }
            if (canonical === expected && equivalents.includes(typed)) {
                return true;
            }
        }
        return false;
    }
    areSpecialCharactersEquivalent(typed, expected) {
        // Map of equivalent special characters
        const specialCharMap = {
            '-': ['-', '\u2013', '\u2014'],
            '...': ['...', '\u2026'],
            '(c)': ['(c)', '\u00A9'],
            '(r)': ['(r)', '\u00AE'],
            '(tm)': ['(tm)', '\u2122'], // (tm), trademark symbol
        };
        // Check if typed and expected are equivalent special characters
        for (const [canonical, equivalents] of Object.entries(specialCharMap)) {
            if (equivalents.includes(typed) && equivalents.includes(expected)) {
                return true;
            }
            if (canonical === typed && equivalents.includes(expected)) {
                return true;
            }
            if (canonical === expected && equivalents.includes(typed)) {
                return true;
            }
        }
        return false;
    }
    handleBackspace() {
        if (!this.currentEditor || !this.startPosition || this.currentPosition === 0)
            return;
        // Move back one position
        this.currentPosition--;
        this.typedText = this.typedText.slice(0, -1);
        // Remove any error at the current position
        this.errors = this.errors.filter(error => error.position !== this.currentPosition);
        // Update stats
        this.statsTracker.removeLastCharacter();
        // Move cursor back
        this.updateCursorPosition();
        // Update decorations
        this.updateDecorations();
    }
    updateCursorPosition() {
        if (!this.currentEditor || !this.startPosition)
            return;
        const document = this.currentEditor.document;
        const startOffset = document.offsetAt(this.startPosition);
        const newOffset = startOffset + this.currentPosition;
        const newPosition = document.positionAt(newOffset);
        // Set cursor position immediately for responsive feel
        this.currentEditor.selection = new vscode.Selection(newPosition, newPosition);
        // Ensure the cursor position is visible
        this.currentEditor.revealRange(new vscode.Range(newPosition, newPosition), vscode.TextEditorRevealType.Default);
    }
    handleSelectionChange(event) {
        if (!this.currentEditor || !this.startPosition)
            return;
        // Calculate the expected cursor position based on current typing position
        const expectedOffset = this.currentEditor.document.offsetAt(this.startPosition) + this.currentPosition;
        const expectedPosition = this.currentEditor.document.positionAt(expectedOffset);
        // If cursor moved away from expected position, move it back
        const currentCursorPosition = event.selections[0].active;
        if (!currentCursorPosition.isEqual(expectedPosition)) {
            // Restore cursor to correct position (but avoid infinite loops)
            setTimeout(() => {
                if (this.currentEditor && this.active) {
                    this.currentEditor.selection = new vscode.Selection(expectedPosition, expectedPosition);
                }
            }, 0);
        }
    }
    updateDecorations() {
        if (!this.currentEditor || !this.startPosition)
            return;
        const currentOffset = this.currentEditor.document.offsetAt(this.startPosition) + this.currentPosition;
        const cursorPosition = this.currentEditor.document.positionAt(currentOffset);
        this.decorationManager.updateDecorations(this.currentEditor, this.typedText, this.originalText, cursorPosition, this.errors);
    }
    completeSession() {
        const summary = this.statsTracker.getSessionSummary();
        vscode.window.showInformationMessage(`ReType Session Complete! 
            WPM: ${summary.averageWpm} | 
            Accuracy: ${summary.finalAccuracy}% | 
            Time: ${summary.duration}s | 
            Errors: ${summary.errors}`, 'New Session', 'Stop').then(selection => {
            if (selection === 'New Session') {
                this.resetSession();
            }
            else {
                this.stopPractice();
            }
        });
    }
    showSessionSummary() {
        const summary = this.statsTracker.getSessionSummary();
        if (summary.totalCharacters > 0) {
            vscode.window.showInformationMessage(`ReType Session Summary:
                Duration: ${summary.duration}s
                Characters: ${summary.correctCharacters}/${summary.totalCharacters}
                WPM: ${summary.averageWpm}
                Accuracy: ${summary.finalAccuracy}%
                Errors: ${summary.errors}`);
        }
    }
    cleanupEventListeners() {
        if (this.typeListener) {
            this.typeListener.dispose();
            this.typeListener = undefined;
        }
        if (this.selectionChangeListener) {
            this.selectionChangeListener.dispose();
            this.selectionChangeListener = undefined;
        }
    }
    dispose() {
        this.stopPractice();
        this.decorationManager.dispose();
        this.cleanupEventListeners();
    }
}
exports.RetypeMode = RetypeMode;
//# sourceMappingURL=retypeMode.js.map