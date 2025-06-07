# ReType - VS Code Extension

Transform your VS Code editor into a typing practice arena! ReType turns any code file into a MonkeyType-style typing practice session, helping you improve your programming typing speed and accuracy.

## 🚀 Features

### Phase 1 (Current)

- **🎯 Practice Mode**: Convert any file into a typing practice session
- **🎨 Visual Feedback**: Solarized Light color scheme with real-time visual feedback
  - Faint text for untyped content
  - Normal color for correctly typed text
  - Red highlighting for errors
  - Green highlighting for current character
- **📊 Real-time Stats**: Live WPM, accuracy, and error tracking in the status bar
- **⚡ Smart Error Handling**: Backspace support with intelligent error correction
- **🔄 Session Management**: Reset and restart sessions easily
- **🖥️ Language Agnostic**: Works with any programming language supported by VS Code

## 📖 Usage

### Getting Started

1. Open any code file in VS Code
2. Position your cursor where you want to start practicing
3. Use one of these methods to start:
   - **Command Palette**: `Ctrl+Shift+P` → "ReType: Start Practice Mode"
   - **Keyboard Shortcut**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### During Practice

- **Type naturally**: Just start typing the code as it appears
- **Visual feedback**: Watch colors change as you type
  - Untyped text appears faded
  - Correct text appears in normal color
  - Incorrect characters are highlighted in red
  - Current character is highlighted in green
- **Real-time stats**: Monitor your progress in the status bar
- **Error correction**: Use backspace to fix mistakes

### Ending Practice

- **Stop Practice**: `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
- **Reset Session**: Use "ReType: Reset Current Session" from command palette
- **Auto-complete**: When you finish typing all text, you'll see a completion dialog

### Available Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `ReType: Start Practice Mode` | `Ctrl+Shift+R` / `Cmd+Shift+R` | Start typing practice on current file |
| `ReType: Stop Practice Mode` | `Ctrl+Shift+E` / `Cmd+Shift+E` | Stop current practice session |
| `ReType: Reset Current Session` | - | Reset current session and start over |

## ⚙️ Settings

Access settings via `File > Preferences > Settings` and search for "ReType":

- **`retype.theme`**: Color theme for typing practice (default: "solarized-light")
- **`retype.showRealTimeStats`**: Show real-time typing statistics in status bar (default: true)

## 🎯 Tips for Best Results

1. **Choose appropriate text**: Start with simpler code snippets and work your way up
2. **Focus on accuracy**: Speed will come naturally with practice
3. **Use proper finger placement**: Practice proper typing technique
4. **Regular practice**: Consistent daily practice yields the best results
5. **Language variety**: Practice with different programming languages to improve versatility

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd retype

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Extension Structure

```
retype-extension/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── retypeMode.ts         # Core typing practice logic
│   ├── decorationManager.ts  # Handle text decorations
│   ├── statsTracker.ts       # Performance tracking
│   ├── themeManager.ts       # Solarized color management
│   └── commands.ts           # Command implementations
├── package.json             # Extension manifest
└── README.md               # This file
```

## 🔧 Recent Updates

### ✅ Fixed: Document Overlay Protection
- **Issue Fixed**: Extension now works as a true overlay without modifying the original document
- **How it works**: Typing is intercepted before it reaches the document, ensuring your code stays untouched
- **Behavior**: 
  - ✅ Original text is never modified
  - ✅ Cursor advances only on correct characters
  - ✅ Incorrect characters are highlighted in red and block progress
  - ✅ Backspace works correctly to fix errors

### ✅ Fixed: Tab Handling & Special Characters
- **Tab Support**: Tab key now works correctly without making code editable
  - ✅ Respects editor settings (tab size, spaces vs tabs)
  - ✅ Tab and space are treated as equivalent for indentation
  - ✅ No more accidental document editing when using Tab
- **Better Visibility**: Untyped text is now darker and easier to read
- **Special Characters**: No more getting stuck on quotes and special symbols
  - ✅ Smart quotes vs straight quotes are treated as equivalent
  - ✅ Unicode normalization handles different character encodings
  - ✅ Support for special symbols like ©, ®, ™, ellipsis, etc.

### ✅ Fixed: MonkeyType-Style Cursor & Syntax Highlighting
- **Perfect Cursor**: Clean line cursor (`│`) just like MonkeyType
  - ✅ No more block cursor appearing over characters
  - ✅ Smooth cursor animations between positions  
  - ✅ Native VS Code cursor completely hidden during practice
- **Preserved Syntax Highlighting**: Your code keeps its colors!
  - ✅ Keywords, strings, numbers stay properly highlighted
  - ✅ Untyped text is faded but retains syntax colors
  - ✅ Typed text shows subtle success indication without color override

## 🐛 Known Issues

- Large files may impact performance during decoration updates
- Some complex Unicode characters may not be handled correctly
- Multi-cursor editing is not supported during practice mode

## 🚀 Upcoming Features (Phase 2)

- Advanced statistics and progress tracking
- Multiple color themes
- Difficulty levels and practice modes
- Achievement system and gamification
- Export statistics and progress data
- Timed practice sessions

## 📄 License

This extension is provided as-is for educational and productivity purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Happy Typing!** 🎉
