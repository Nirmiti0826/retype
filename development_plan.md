# ReType - VS Code Extension Development Plan

## Product Overview
A VS Code extension that transforms code editing into a typing practice experience, similar to MonkeyType but specifically designed for programming languages. Users can practice typing over existing code with real-time feedback and performance tracking.

## Core Features

### Phase 1 - MVP (Minimum Viable Product)

#### 1. Core Functionality
- **Retypable Mode**: Toggle mode that converts any file into a typing practice session
- **Cursor Positioning**: Users can position cursor anywhere in the file to start typing practice
- **Overlay Interface**: Non-intrusive overlay on the existing editor without disrupting normal workflow

#### 2. Visual Feedback System
- **Color Scheme**: Solarized Light theme-based color transitions
  - **Untyped text**: Faint/muted color (waiting to be typed)
  - **Correctly typed**: Dark/normal color (completed)
  - **Incorrect characters**: Red highlighting for errors
  - **Current character**: Green highlighting for correct input
- **Real-time Updates**: Immediate visual feedback as user types

#### 3. Typing Mechanics
- **Error Handling**: Allow backspace to correct mistakes
- **Language Agnostic**: Support for all programming languages in VS Code
- **Preserve Formatting**: Maintain original code indentation and structure

#### 4. User Interface
- **Command Panel Integration**: 
  - `ReType: Start Practice Mode`
  - `ReType: Stop Practice Mode`
  - `ReType: Reset Current Session`
- **Status Bar**: Show current mode and basic stats during practice

#### 5. Technical Implementation
- **Editor Decoration API**: Use VS Code's decoration API for color changes
- **Event Listeners**: Capture typing events without interfering with normal editing
- **State Management**: Track cursor position, typed characters, and errors

### Phase 2 - Enhanced Features

#### 1. Performance Tracking
- **Real-time Metrics Display**:
  - Words Per Minute (WPM)
  - Characters Per Minute (CPM)
  - Accuracy percentage
  - Error count
- **Session Statistics**: Track progress within current practice session

#### 2. Advanced Settings
- **Difficulty Levels**:
  - Beginner: Simple syntax, common keywords
  - Intermediate: Mixed complexity
  - Advanced: Complex algorithms, unusual syntax
- **Practice Modes**:
  - Timed sessions
  - Target accuracy mode
  - Specific language focus

#### 3. Syntax Highlighting Integration
- **Smart Highlighting**: Maintain syntax colors while providing typing feedback
- **Language-Specific Practice**: Focus on language-specific keywords and patterns

#### 4. Data Persistence
- **Statistics Storage**: Save typing speed, accuracy, and progress over time
- **Session History**: Track improvement trends
- **Export Data**: Allow users to export their progress data

#### 5. Gamification Elements
- **Achievements System**:
  - Speed milestones (30 WPM, 50 WPM, 70 WPM, etc.)
  - Accuracy achievements (95%, 98%, 99% accuracy)
  - Language mastery badges
  - Consistency streaks
- **Progress Visualization**: Charts and graphs showing improvement over time
- **Leaderboards**: Optional community features for competitive typing

## Technical Architecture

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
├── resources/
│   ├── themes/              # Color scheme definitions
│   └── icons/               # Extension icons
├── package.json             # Extension manifest
└── README.md               # Documentation
```

### Key Technologies
- **VS Code Extension API**: Core framework
- **TypeScript**: Primary development language
- **Decoration API**: For text color changes
- **Workspace State**: For data persistence
- **Command API**: For command palette integration

## Development Milestones

### Milestone 1 (Week 1-2)
- [ ] Basic extension scaffold
- [ ] Command palette integration
- [ ] Simple overlay mode toggle
- [ ] Basic text decoration system

### Milestone 2 (Week 3-4)
- [ ] Typing event capture and processing
- [ ] Solarized color scheme implementation
- [ ] Error handling and backspace support
- [ ] Real-time visual feedback

### Milestone 3 (Week 5-6)
- [ ] Performance metrics calculation
- [ ] Status bar integration
- [ ] Session management
- [ ] Multi-language support testing

### Milestone 4 (Phase 2 - Week 7-10)
- [ ] Advanced settings panel
- [ ] Statistics persistence
- [ ] Achievement system
- [ ] Performance analytics and visualization

## Success Metrics
- **User Engagement**: Active daily users, session duration
- **Performance Improvement**: Average WPM and accuracy improvements
- **Extension Adoption**: Downloads, ratings, and reviews
- **Language Coverage**: Support for major programming languages

## Future Enhancements (Phase 3+)
- **Collaborative Features**: Team challenges and competitions
- **AI-Powered Practice**: Personalized code snippets based on user's skill level
- **Integration with Git**: Practice typing recent commits or code changes
- **Code Snippet Library**: Curated collection of common programming patterns
- **Mobile Companion**: Practice on mobile devices with synchronized progress



## Bugs from Phase 1

### ✅ FIXED: Document Modification Prevention
**Issue**: When typing during practice, the underlying text was being modified instead of working as a pure overlay.

**Solution**: 
- Replaced `onDidChangeTextDocument` listener with `type` command override
- Intercepted typing events before they modify the document
- Implemented pure overlay approach where:
  - Original text remains completely unchanged
  - Cursor advances only on correct character input
  - Errors are highlighted in red and block progress until corrected
  - All typing logic handled through decorations and visual feedback

**Technical Changes**:
- Modified `retypeMode.ts` to use `vscode.commands.registerCommand('type')` 
- Added `currentPosition` tracking separate from document changes
- Implemented `handleTyping()` method that prevents default typing behavior
- Updated cursor positioning to be manual and controlled


### ✅ FIXED: Tab Handling and Visual Improvements (Bug 2)
**Issues**: 
- Tab key was making code editable instead of handling indentation
- Tab/space equivalence not properly handled
- Untyped text was too faint to read

**Solutions**:
- Added `tab` command override to intercept tab key presses
- Implemented tab-to-space conversion based on editor settings
- Added tab/space equivalence in character matching
- Darkened untyped text color from `#93a1a1` to `#657b83`
- Removed opacity overlay on untyped text for better readability

**Technical Changes**:
- Added `handleTabInput()` method with editor configuration awareness
- Enhanced `isCharacterMatch()` to handle tab/space equivalence
- Updated `getSolarizedLightColors()` in `themeManager.ts`
- Registered `tab` command override in `setupEventListeners()`

### ✅ FIXED: Special Character Handling (Bug 3)
**Issue**: Extension getting stuck on special characters like quotes

**Solutions**:
- Added Unicode normalization for character matching
- Implemented quote equivalence (straight vs curly quotes)
- Added special character equivalence handling
- Enhanced character matching with defensive programming
- Added debug logging for character mismatch troubleshooting

**Technical Changes**:
- Added `normalizeCharacter()` method using Unicode NFC normalization
- Implemented `areQuotesEquivalent()` for quote character variants
- Added `areSpecialCharactersEquivalent()` for common special characters
- Enhanced `isCharacterMatch()` with multiple fallback strategies
- Added comprehensive debug logging for character matching issues


### ✅ FIXED: Cursor Style and Syntax Highlighting (Bug 3)
**Issues**: 
- Block cursor appearing instead of line cursor during practice
- Typed code losing syntax highlighting

**Solutions**:
- **Hidden Native Cursor**: Completely hide VS Code's native cursor during practice mode
- **Custom Animated Cursor**: Implement MonkeyType-style animated cursor using decorations
- **Preserved Syntax Highlighting**: Use opacity and subtle backgrounds instead of color overrides
- **Smooth Animations**: Added cursor positioning animations like MonkeyType

**Technical Changes**:
- Use native VS Code cursor properly positioned (line style)
- Removed dual cursor system to eliminate cursor duplication
- Modified decoration types to preserve syntax highlighting:
  - Untyped text: Uses opacity instead of color override
  - Correct text: Subtle background without color changes  
  - Current position: Simple highlight without custom cursor elements
- Restored proper cursor position tracking with `updateCursorPosition()`
- Simplified `applyDecorations()` to use single native cursor with highlighting