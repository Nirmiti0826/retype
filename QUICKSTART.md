# ReType - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### 1. Install Dependencies
```bash
npm install
npm run compile
```

### 2. Test the Extension
1. Press `F5` to open a new VS Code window with the extension loaded
2. Open one of the sample files:
   - `sample-practice.js` (JavaScript)
   - `sample-practice.py` (Python)

### 3. Start Practicing
1. Position your cursor anywhere in the file
2. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. Start typing! Watch the colors change as you type

### 4. Visual Feedback & Behavior
- **Faded text**: What you haven't typed yet
- **Normal text**: What you've typed correctly
- **Red text**: Errors (cursor stops here until you type the correct character)
- **Green highlight**: Current character to type
- **📝 Important**: Your original text is NEVER modified - this is a pure overlay!

### 5. Monitor Progress
- Check the status bar for real-time WPM, accuracy, and error count
- Complete a section to see your session summary

### 6. Controls
- `Ctrl+Shift+R` / `Cmd+Shift+R`: Start practice
- `Ctrl+Shift+E` / `Cmd+Shift+E`: Stop practice
- Command Palette → "ReType: Reset Current Session": Start over

## 🎯 Tips for Best Experience

1. **Start small**: Begin with a few lines of code
2. **Focus on accuracy**: Speed comes with practice
3. **Use proper typing technique**: All fingers, proper posture
4. **Practice regularly**: 10-15 minutes daily is better than long sessions
5. **Try different languages**: Each has unique typing patterns

## 🔧 Development Mode

To work on the extension:
```bash
npm run watch  # Auto-compile on changes
```

Then press `F5` to launch the extension host and test your changes.

## 📁 Sample Files Included

- `sample-practice.js`: JavaScript with modern ES6+ syntax
- `sample-practice.py`: Python with common patterns and constructs  
- `test-overlay.js`: Simple test file for overlay functionality
- `test-special-chars.js`: Special characters and quotes testing
- `test-cursor-animation.js`: Cursor animation and syntax highlighting testing

## 🐛 Troubleshooting

**Extension not loading?**
- Make sure you compiled with `npm run compile`
- Check the Debug Console for errors

**Colors not showing?**
- Ensure you started practice mode with `Ctrl+Shift+R`
- Try restarting the practice session

**Cursor not advancing?**
- This is normal! The cursor only moves when you type the CORRECT character
- If stuck on a red character, you must type the exact character shown
- Use backspace to go back and fix errors

**Text getting modified accidentally?**
- This should NOT happen anymore! If it does, please report as a bug
- The extension now works as a pure overlay without touching your original code

**Performance issues?**
- Avoid very large files (>1000 lines)
- Close other resource-intensive extensions

---

**Ready to improve your coding typing speed? Start practicing now!** 🎉 