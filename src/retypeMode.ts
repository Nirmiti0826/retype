import * as vscode from 'vscode';
import { DecorationManager } from './decorationManager';
import { StatsTracker } from './statsTracker';

export class RetypeMode {
    private context: vscode.ExtensionContext;
    private statsTracker: StatsTracker;
    private decorationManager: DecorationManager;
    private active: boolean = false;
    private currentEditor: vscode.TextEditor | undefined;
    private startPosition: vscode.Position | undefined;
    private originalText: string = '';
    private typedText: string = '';
    private typeListener: vscode.Disposable | undefined;
    private selectionChangeListener: vscode.Disposable | undefined;
    private modeChangedCallback: (() => void) | undefined;
    private errors: { position: number; character: string }[] = [];
    private currentPosition: number = 0; // Current position in the text being typed
    private isReadOnly: boolean = false;
    private originalCursorStyle: vscode.TextEditorCursorStyle | undefined;

    constructor(context: vscode.ExtensionContext, statsTracker: StatsTracker) {
        this.context = context;
        this.statsTracker = statsTracker;
        this.decorationManager = new DecorationManager();
    }

    public async startPractice(editor: vscode.TextEditor): Promise<void> {
        if (this.active) {
            throw new Error('Practice mode is already active');
        }

        this.currentEditor = editor;
        
        // Check if cursor is at the end of the document
        const document = editor.document;
        const lastPosition = document.positionAt(document.getText().length);
        const currentPosition = editor.selection.active;
        
        // If cursor is at or near the end of the document, move to the beginning
        if (currentPosition.line >= lastPosition.line - 1 && 
            currentPosition.character >= lastPosition.character - 1) {
            this.startPosition = new vscode.Position(0, 0);
            editor.selection = new vscode.Selection(this.startPosition, this.startPosition);
        } else {
            this.startPosition = editor.selection.active;
        }
        
        this.active = true;
        this.typedText = '';
        this.errors = [];
        this.currentPosition = 0;

        // Get text from cursor position to end of document
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

    public stopPractice(): void {
        if (!this.active) return;

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

    public resetSession(): void {
        if (!this.active || !this.currentEditor || !this.startPosition) return;

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

    public isActive(): boolean {
        return this.active;
    }

    public onModeChanged(callback: () => void): void {
        this.modeChangedCallback = callback;
    }

    private setupEventListeners(): void {
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

        // Intercept backspace command
        const backspaceListener = vscode.commands.registerCommand('deleteLeft', () => {
            if (!this.active || !this.currentEditor) {
                return vscode.commands.executeCommand('default:deleteLeft');
            }
            
            // Handle backspace in practice mode
            this.handleBackspace();
            return; // Don't execute default backspace to prevent document modification
        });

        this.context.subscriptions.push(backspaceListener);

        // Prevent left arrow key movement during practice
        const leftArrowListener = vscode.commands.registerCommand('cursorLeft', () => {
            if (!this.active || !this.currentEditor) {
                return vscode.commands.executeCommand('default:cursorLeft');
            }
            // Do nothing - prevent cursor movement during practice
            return;
        });

        this.context.subscriptions.push(leftArrowListener);

        // Prevent right arrow key movement during practice
        const rightArrowListener = vscode.commands.registerCommand('cursorRight', () => {
            if (!this.active || !this.currentEditor) {
                return vscode.commands.executeCommand('default:cursorRight');
            }
            // Do nothing - prevent cursor movement during practice
            return;
        });

        this.context.subscriptions.push(rightArrowListener);

        // Prevent other cursor movement commands
        const cursorMovementCommands = [
            'cursorUp', 'cursorDown', 'cursorHome', 'cursorEnd',
            'cursorPageUp', 'cursorPageDown', 'cursorWordLeft', 'cursorWordRight'
        ];

        cursorMovementCommands.forEach(command => {
            const listener = vscode.commands.registerCommand(command, () => {
                if (!this.active || !this.currentEditor) {
                    return vscode.commands.executeCommand(`default:${command}`);
                }
                // Do nothing - prevent cursor movement during practice
                return;
            });
            this.context.subscriptions.push(listener);
        });

        // Listen for selection changes to keep cursor in correct position
        this.selectionChangeListener = vscode.window.onDidChangeTextEditorSelection((event) => {
            if (!this.active || !this.currentEditor || event.textEditor !== this.currentEditor) {
                return;
            }

            this.handleSelectionChange(event);
        });
    }

    private handleTyping(text: string): void {
        if (!this.currentEditor || !this.startPosition) return;

        for (const character of text) {
            if (character === '\b' || character === '\x08') {
                // Handle backspace
                this.handleBackspace();
            } else if (character.length > 0) {
                // Handle regular character input (ensure character is not empty)
                this.handleCharacterInput(character);
            }
        }
    }

    private handleTabInput(): void {
        if (!this.currentEditor || !this.startPosition) return;

        // Get editor configuration for tab settings
        const editorConfig = vscode.workspace.getConfiguration('editor', this.currentEditor.document.uri);
        const tabSize = editorConfig.get<number>('tabSize', 4);
        const insertSpaces = editorConfig.get<boolean>('insertSpaces', true);

        if (insertSpaces) {
            // Convert tab to spaces
            const spacesToAdd = tabSize - (this.currentPosition % tabSize);
            const spacesString = ' '.repeat(spacesToAdd);
            this.handleTyping(spacesString);
        } else {
            // Handle actual tab character
            this.handleCharacterInput('\t');
        }
    }

    private handleCharacterInput(character: string): void {
        if (!this.currentEditor || !this.startPosition) return;

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
        } else {
            // Incorrect character - add/update error but don't advance
            const existingErrorIndex = this.errors.findIndex(error => error.position === this.currentPosition);
            if (existingErrorIndex >= 0) {
                this.errors[existingErrorIndex].character = character;
            } else {
                this.errors.push({ position: this.currentPosition, character });
            }

            // Debug logging for character mismatch (can be helpful for troubleshooting)
            console.debug('ReType: Character mismatch at position', this.currentPosition, 
                'Expected:', JSON.stringify(expectedCharacter), 
                'Typed:', JSON.stringify(character),
                'Expected char code:', expectedCharacter.charCodeAt(0),
                'Typed char code:', character.charCodeAt(0));
        }

        // Update visual decorations
        this.updateDecorations();
    }

    private isCharacterMatch(typed: string, expected: string): boolean {
        // Direct match
        if (typed === expected) {
            return true;
        }

        // Check if expected character is an image icon or special symbol that should accept any input
        if (this.isImageIconOrSpecialSymbol(expected)) {
            return true; // Accept any character for image icons and special symbols
        }

        // Normalize characters to handle different encodings
        const normalizedTyped = this.normalizeCharacter(typed);
        const normalizedExpected = this.normalizeCharacter(expected);
        
        if (normalizedTyped === normalizedExpected) {
            return true;
        }

        // Handle tab/space equivalence
        if (!this.currentEditor) return false;

        const editorConfig = vscode.workspace.getConfiguration('editor', this.currentEditor.document.uri);
        const tabSize = editorConfig.get<number>('tabSize', 4);

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

    private isImageIconOrSpecialSymbol(char: string): boolean {
        const charCode = char.charCodeAt(0);
        
        // Unicode ranges for common image/icon symbols and special characters
        const iconRanges = [
            // Emoticons and symbols
            [0x2600, 0x26FF], // Miscellaneous Symbols
            [0x2700, 0x27BF], // Dingbats
            [0x1F300, 0x1F5FF], // Miscellaneous Symbols and Pictographs
            [0x1F600, 0x1F64F], // Emoticons
            [0x1F680, 0x1F6FF], // Transport and Map Symbols
            [0x1F700, 0x1F77F], // Alchemical Symbols
            [0x1F780, 0x1F7FF], // Geometric Shapes Extended
            [0x1F800, 0x1F8FF], // Supplemental Arrows-C
            [0x1F900, 0x1F9FF], // Supplemental Symbols and Pictographs
            [0x1FA00, 0x1FA6F], // Chess Symbols
            [0x1FA70, 0x1FAFF], // Symbols and Pictographs Extended-A
            // Mathematical symbols
            [0x2200, 0x22FF], // Mathematical Operators
            [0x2300, 0x23FF], // Miscellaneous Technical
            [0x25A0, 0x25FF], // Geometric Shapes
            [0x2190, 0x21FF], // Arrows
            // Currency symbols
            [0x20A0, 0x20CF], // Currency Symbols
            // Other special characters that might be difficult to type
            [0x00A0, 0x00FF], // Latin-1 Supplement (includes many special chars)
            [0x2000, 0x206F], // General Punctuation
        ];

        // Check if character falls within any icon/symbol range
        for (const [start, end] of iconRanges) {
            if (charCode >= start && charCode <= end) {
                return true;
            }
        }

        // Additional checks for specific problematic characters
        const problematicChars = [
            '\u00A9', // Copyright symbol
            '\u00AE', // Registered trademark
            '\u2122', // Trademark symbol
            '\u2026', // Horizontal ellipsis
            '\u2013', '\u2014', // En dash, Em dash
            '\u201C', '\u201D', // Left/right double quotation marks
            '\u2018', '\u2019', // Left/right single quotation marks
            '\u00B0', // Degree symbol
            '\u00B1', // Plus-minus sign
            '\u00D7', // Multiplication sign
            '\u00F7', // Division sign
            '\u221E', // Infinity symbol
            '\u2260', // Not equal to
            '\u2264', '\u2265', // Less than or equal to, Greater than or equal to
        ];

        return problematicChars.includes(char);
    }

    private normalizeCharacter(char: string): string {
        // Normalize Unicode to handle different representations of the same character
        return char.normalize('NFC');
    }

    private areQuotesEquivalent(typed: string, expected: string): boolean {
        // Map of equivalent quote characters using Unicode escape sequences
        const quoteMap: { [key: string]: string[] } = {
            '"': ['"', '\u201C', '\u201D'], // straight double quote, left double quote, right double quote
            "'": ["'", '\u2018', '\u2019', '`'], // straight single quote, left single quote, right single quote, backtick
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

    private areSpecialCharactersEquivalent(typed: string, expected: string): boolean {
        // Map of equivalent special characters
        const specialCharMap: { [key: string]: string[] } = {
            '-': ['-', '\u2013', '\u2014'], // hyphen, en dash, em dash
            '...': ['...', '\u2026'], // three dots, ellipsis
            '(c)': ['(c)', '\u00A9'], // (c), copyright symbol
            '(r)': ['(r)', '\u00AE'], // (r), registered trademark
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

    private handleBackspace(): void {
        if (!this.currentEditor || !this.startPosition || this.currentPosition === 0) return;

        // Move back one position
        this.currentPosition--;
        this.typedText = this.typedText.slice(0, -1);

        // Remove any error at the current position
        this.errors = this.errors.filter(error => error.position !== this.currentPosition);

        // Update stats - remove the last character
        this.statsTracker.removeLastCharacter();

        // Move cursor back to the correct position
        this.updateCursorPosition();

        // Update visual decorations to reflect the change
        this.updateDecorations();

        // Log for debugging
        console.debug('ReType: Backspace - moved to position', this.currentPosition);
    }

    private updateCursorPosition(): void {
        if (!this.currentEditor || !this.startPosition) return;

        const document = this.currentEditor.document;
        const startOffset = document.offsetAt(this.startPosition);
        const newOffset = startOffset + this.currentPosition;
        const newPosition = document.positionAt(newOffset);

        // Set cursor position immediately for responsive feel
        this.currentEditor.selection = new vscode.Selection(newPosition, newPosition);

        // Ensure the cursor position is visible
        this.currentEditor.revealRange(
            new vscode.Range(newPosition, newPosition),
            vscode.TextEditorRevealType.Default
        );
    }

    private handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
        if (!this.currentEditor || !this.startPosition) return;

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

    private updateDecorations(): void {
        if (!this.currentEditor || !this.startPosition) return;

        const currentOffset = this.currentEditor.document.offsetAt(this.startPosition) + this.currentPosition;
        const cursorPosition = this.currentEditor.document.positionAt(currentOffset);

        this.decorationManager.updateDecorations(
            this.currentEditor,
            this.typedText,
            this.originalText,
            cursorPosition,
            this.errors
        );
    }

    private completeSession(): void {
        const summary = this.statsTracker.getSessionSummary();
        
        vscode.window.showInformationMessage(
            `ReType Session Complete! 
            WPM: ${summary.averageWpm} | 
            Accuracy: ${summary.finalAccuracy}% | 
            Time: ${summary.duration}s | 
            Errors: ${summary.errors}`,
            'New Session',
            'Stop'
        ).then(selection => {
            if (selection === 'New Session') {
                this.resetSession();
            } else {
                this.stopPractice();
            }
        });
    }

    private showSessionSummary(): void {
        const summary = this.statsTracker.getSessionSummary();
        
        if (summary.totalCharacters > 0) {
            vscode.window.showInformationMessage(
                `ReType Session Summary:
                Duration: ${summary.duration}s
                Characters: ${summary.correctCharacters}/${summary.totalCharacters}
                WPM: ${summary.averageWpm}
                Accuracy: ${summary.finalAccuracy}%
                Errors: ${summary.errors}`
            );
        }
    }

    private cleanupEventListeners(): void {
        if (this.typeListener) {
            this.typeListener.dispose();
            this.typeListener = undefined;
        }

        if (this.selectionChangeListener) {
            this.selectionChangeListener.dispose();
            this.selectionChangeListener = undefined;
        }

        // Note: Other command listeners are automatically disposed when the extension context is disposed
        // since they were added to this.context.subscriptions
    }

    public dispose(): void {
        this.stopPractice();
        this.decorationManager.dispose();
        this.cleanupEventListeners();
    }
} 