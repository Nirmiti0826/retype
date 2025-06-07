"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
const vscode = require("vscode");
class ThemeManager {
    constructor() {
        this.currentTheme = vscode.workspace.getConfiguration('retype').get('theme', 'solarized-light');
        this.colors = this.getSolarizedLightColors();
    }
    getSolarizedLightColors() {
        return {
            // Solarized Light base colors
            untypedText: '#657b83',
            correctText: '#586e75',
            incorrectText: '#dc322f',
            currentCharacter: '#859900',
            background: {
                correct: 'transparent',
                incorrect: '#fdf6e3',
                current: '#eee8d5' // base2 - slightly darker for current char
            }
        };
    }
    getColors() {
        return this.colors;
    }
    createDecorationTypes() {
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
    updateTheme(newTheme) {
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
    getCurrentTheme() {
        return this.currentTheme;
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map