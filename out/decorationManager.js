"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationManager = void 0;
const vscode = require("vscode");
const themeManager_1 = require("./themeManager");
class DecorationManager {
    constructor() {
        this.isDisposed = false;
        this.themeManager = new themeManager_1.ThemeManager();
        this.decorationTypes = this.themeManager.createDecorationTypes();
        this.currentState = {
            untypedRanges: [],
            correctRanges: [],
            incorrectRanges: [],
            currentRange: null
        };
    }
    initializeDecorations(editor, startPosition) {
        if (this.isDisposed)
            return;
        const document = editor.document;
        const documentText = document.getText();
        const startOffset = document.offsetAt(startPosition);
        const endOffset = documentText.length;
        // Create range for all untyped text from start position to end of document
        if (startOffset < endOffset) {
            const untypedRange = new vscode.Range(startPosition, document.positionAt(endOffset));
            this.currentState.untypedRanges = [untypedRange];
        }
        this.applyDecorations(editor);
    }
    updateDecorations(editor, typedText, originalText, currentPosition, errors) {
        if (this.isDisposed)
            return;
        const document = editor.document;
        this.currentState = {
            untypedRanges: [],
            correctRanges: [],
            incorrectRanges: [],
            currentRange: null
        };
        // Calculate ranges based on typed text
        const typedLength = typedText.length;
        const startOffset = document.offsetAt(currentPosition) - typedLength;
        // Correct text ranges
        let correctRanges = [];
        let incorrectRanges = [];
        for (let i = 0; i < typedLength; i++) {
            const charOffset = startOffset + i;
            const charPosition = document.positionAt(charOffset);
            const charRange = new vscode.Range(charPosition, charPosition.translate(0, 1));
            // Check if this character is an error
            const isError = errors.some(error => error.position === i);
            if (isError) {
                incorrectRanges.push(charRange);
            }
            else {
                correctRanges.push(charRange);
            }
        }
        this.currentState.correctRanges = correctRanges;
        this.currentState.incorrectRanges = incorrectRanges;
        // Current character range (where the cursor should be)
        if (typedLength < originalText.length) {
            const currentCharOffset = startOffset + typedLength;
            const currentCharPosition = document.positionAt(currentCharOffset);
            this.currentState.currentRange = new vscode.Range(currentCharPosition, currentCharPosition.translate(0, 1));
        }
        // Untyped text ranges (everything after current position)
        const untypedStartOffset = startOffset + typedLength + 1;
        const documentEndOffset = document.getText().length;
        if (untypedStartOffset < documentEndOffset) {
            const untypedRange = new vscode.Range(document.positionAt(untypedStartOffset), document.positionAt(documentEndOffset));
            this.currentState.untypedRanges = [untypedRange];
        }
        // Apply decorations with smooth transition
        this.applyDecorationsWithAnimation(editor);
    }
    applyDecorationsWithAnimation(editor) {
        if (this.isDisposed)
            return;
        // Apply decorations immediately for responsive feel
        this.applyDecorations(editor);
    }
    clearDecorations(editor) {
        if (this.isDisposed)
            return;
        editor.setDecorations(this.decorationTypes.untypedDecoration, []);
        editor.setDecorations(this.decorationTypes.correctDecoration, []);
        editor.setDecorations(this.decorationTypes.incorrectDecoration, []);
        editor.setDecorations(this.decorationTypes.currentDecoration, []);
        editor.setDecorations(this.decorationTypes.animatedCursor, []);
    }
    applyDecorations(editor) {
        if (this.isDisposed)
            return;
        try {
            // Apply untyped text decorations
            editor.setDecorations(this.decorationTypes.untypedDecoration, this.currentState.untypedRanges);
            // Apply correct text decorations
            editor.setDecorations(this.decorationTypes.correctDecoration, this.currentState.correctRanges);
            // Apply incorrect text decorations
            editor.setDecorations(this.decorationTypes.incorrectDecoration, this.currentState.incorrectRanges);
            // Apply current character decoration (where cursor should be)
            const currentRanges = this.currentState.currentRange ? [this.currentState.currentRange] : [];
            editor.setDecorations(this.decorationTypes.currentDecoration, currentRanges);
            // Don't use the animated cursor decoration to avoid dual cursors
            editor.setDecorations(this.decorationTypes.animatedCursor, []);
        }
        catch (error) {
            console.error('Error applying decorations:', error);
        }
    }
    dispose() {
        this.isDisposed = true;
        // Dispose all decoration types
        this.decorationTypes.untypedDecoration.dispose();
        this.decorationTypes.correctDecoration.dispose();
        this.decorationTypes.incorrectDecoration.dispose();
        this.decorationTypes.currentDecoration.dispose();
        this.decorationTypes.animatedCursor.dispose();
    }
}
exports.DecorationManager = DecorationManager;
//# sourceMappingURL=decorationManager.js.map