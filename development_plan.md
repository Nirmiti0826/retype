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

