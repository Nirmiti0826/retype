import * as vscode from 'vscode';
import { ThemeManager } from './themeManager';

export interface DecorationState {
    untypedRanges: vscode.Range[];
    correctRanges: vscode.Range[];
    incorrectRanges: vscode.Range[];
    currentRange: vscode.Range | null;
}

export class DecorationManager {
    private themeManager: ThemeManager;
    private decorationTypes: {
        untypedDecoration: vscode.TextEditorDecorationType;
        correctDecoration: vscode.TextEditorDecorationType;
        incorrectDecoration: vscode.TextEditorDecorationType;
        currentDecoration: vscode.TextEditorDecorationType;
        animatedCursor: vscode.TextEditorDecorationType;
    };
    private currentState: DecorationState;
    private isDisposed: boolean = false;

    constructor() {
        this.themeManager = new ThemeManager();
        this.decorationTypes = this.themeManager.createDecorationTypes();
        this.currentState = {
            untypedRanges: [],
            correctRanges: [],
            incorrectRanges: [],
            currentRange: null
        };
    }

    public initializeDecorations(editor: vscode.TextEditor, startPosition: vscode.Position): void {
        if (this.isDisposed) return;

        const document = editor.document;
        const documentText = document.getText();
        const startOffset = document.offsetAt(startPosition);
        const endOffset = documentText.length;

        // Create range for all untyped text from start position to end of document
        if (startOffset < endOffset) {
            const untypedRange = new vscode.Range(
                startPosition,
                document.positionAt(endOffset)
            );
            this.currentState.untypedRanges = [untypedRange];
        }

        this.applyDecorations(editor);
    }

    public updateDecorations(
        editor: vscode.TextEditor,
        typedText: string,
        originalText: string,
        currentPosition: vscode.Position,
        errors: { position: number; character: string }[]
    ): void {
        if (this.isDisposed) return;

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
        let correctRanges: vscode.Range[] = [];
        let incorrectRanges: vscode.Range[] = [];

        for (let i = 0; i < typedLength; i++) {
            const charOffset = startOffset + i;
            const charPosition = document.positionAt(charOffset);
            const charRange = new vscode.Range(charPosition, charPosition.translate(0, 1));

            // Check if this character is an error
            const isError = errors.some(error => error.position === i);
            
            if (isError) {
                incorrectRanges.push(charRange);
            } else {
                correctRanges.push(charRange);
            }
        }

        this.currentState.correctRanges = correctRanges;
        this.currentState.incorrectRanges = incorrectRanges;

        // Current character range (where the cursor should be)
        if (typedLength < originalText.length) {
            const currentCharOffset = startOffset + typedLength;
            const currentCharPosition = document.positionAt(currentCharOffset);
            this.currentState.currentRange = new vscode.Range(
                currentCharPosition,
                currentCharPosition.translate(0, 1)
            );
        }

        // Untyped text ranges (everything after current position)
        const untypedStartOffset = startOffset + typedLength + 1;
        const documentEndOffset = document.getText().length;
        
        if (untypedStartOffset < documentEndOffset) {
            const untypedRange = new vscode.Range(
                document.positionAt(untypedStartOffset),
                document.positionAt(documentEndOffset)
            );
            this.currentState.untypedRanges = [untypedRange];
        }

        // Apply decorations with smooth transition
        this.applyDecorationsWithAnimation(editor);
    }

    private applyDecorationsWithAnimation(editor: vscode.TextEditor): void {
        if (this.isDisposed) return;

        // Apply decorations immediately for responsive feel
        this.applyDecorations(editor);
    }

    public clearDecorations(editor: vscode.TextEditor): void {
        if (this.isDisposed) return;

        editor.setDecorations(this.decorationTypes.untypedDecoration, []);
        editor.setDecorations(this.decorationTypes.correctDecoration, []);
        editor.setDecorations(this.decorationTypes.incorrectDecoration, []);
        editor.setDecorations(this.decorationTypes.currentDecoration, []);
        editor.setDecorations(this.decorationTypes.animatedCursor, []);
    }

    private applyDecorations(editor: vscode.TextEditor): void {
        if (this.isDisposed) return;

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
        } catch (error) {
            console.error('Error applying decorations:', error);
        }
    }

    public dispose(): void {
        this.isDisposed = true;
        
        // Dispose all decoration types
        this.decorationTypes.untypedDecoration.dispose();
        this.decorationTypes.correctDecoration.dispose();
        this.decorationTypes.incorrectDecoration.dispose();
        this.decorationTypes.currentDecoration.dispose();
        this.decorationTypes.animatedCursor.dispose();
    }
} 