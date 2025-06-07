import * as vscode from 'vscode';

export interface ThemeColors {
    untypedText: vscode.ThemeColor | string;
    correctText: vscode.ThemeColor | string;
    incorrectText: vscode.ThemeColor | string;
    currentCharacter: vscode.ThemeColor | string;
    background: {
        correct: vscode.ThemeColor | string;
        incorrect: vscode.ThemeColor | string;
        current: vscode.ThemeColor | string;
    };
}

export class ThemeManager {
    private currentTheme: string;
    private colors: ThemeColors;

    constructor() {
        this.currentTheme = vscode.workspace.getConfiguration('retype').get('theme', 'solarized-light');
        this.colors = this.getSolarizedLightColors();
    }

    private getSolarizedLightColors(): ThemeColors {
        return {
            // Solarized Light base colors
            untypedText: '#657b83',      // base00 - darker for better readability
            correctText: '#586e75',      // base01 - dark for correctly typed text
            incorrectText: '#dc322f',     // red - for errors
            currentCharacter: '#859900',  // green - for current character
            background: {
                correct: 'transparent',
                incorrect: '#fdf6e3',     // base3 - light background for errors
                current: '#eee8d5'        // base2 - slightly darker for current char
            }
        };
    }

    public getColors(): ThemeColors {
        return this.colors;
    }

    public createDecorationTypes(): {
        untypedDecoration: vscode.TextEditorDecorationType;
        correctDecoration: vscode.TextEditorDecorationType;
        incorrectDecoration: vscode.TextEditorDecorationType;
        currentDecoration: vscode.TextEditorDecorationType;
        animatedCursor: vscode.TextEditorDecorationType;
    } {
        const colors = this.getColors();

        // Untyped text: reduce opacity to make it faded while preserving syntax highlighting
        const untypedDecoration = vscode.window.createTextEditorDecorationType({
            opacity: '0.4',
            backgroundColor: 'rgba(0, 0, 0, 0.05)' // Very subtle background
        });

        // Correct text: preserve syntax highlighting with subtle success indication
        const correctDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(133, 153, 0, 0.08)' // Very subtle green background to indicate completion
        });

        // Incorrect text: clear error indication while preserving syntax highlighting
        const incorrectDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: colors.background.incorrect,
            textDecoration: 'underline wavy red',
            border: '1px solid red'
        });

        // Current character: highlight the character being typed (no custom cursor)
        const currentDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(133, 153, 0, 0.25)',
            border: '1px solid #859900',
            borderRadius: '2px'
        });

        // Animated cursor for MonkeyType-style experience
        const animatedCursor = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'transparent',
            border: 'none',
            before: {
                contentText: '│',
                color: '#859900',
                fontWeight: 'bold',
                width: '2px',
                textDecoration: 'none'
            }
        });

        return {
            untypedDecoration,
            correctDecoration,
            incorrectDecoration,
            currentDecoration,
            animatedCursor
        };
    }

    public updateTheme(newTheme: string): void {
        this.currentTheme = newTheme;
        
        switch (newTheme) {
            case 'solarized-light':
                this.colors = this.getSolarizedLightColors();
                break;
            default:
                this.colors = this.getSolarizedLightColors();
                break;
        }
    }

    public getCurrentTheme(): string {
        return this.currentTheme;
    }
} 