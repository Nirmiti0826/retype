// Cursor Animation Test File for ReType
// This file tests the MonkeyType-style cursor behavior and syntax highlighting

// Test cursor movement through different syntax elements
function testCursorAnimation() {
    const message = "Testing cursor animation";
    console.log(message);
    
    // Test with strings - should preserve string highlighting
    const stringTest = "Quotes and 'mixed' `quotes`";
    
    // Test with numbers and operators
    const mathTest = 42 + 58 * 3.14;
    
    // Test with keywords and built-ins
    if (mathTest > 100) {
        return true;
    }
    
    // Test with complex syntax
    const objectTest = {
        name: "test",
        value: 123,
        nested: {
            prop: "value"
        }
    };
    
    return false;
}

// Test indentation and special characters
class TestClass {
    constructor(name) {
        this.name = name;
        this.items = [];
    }
    
    addItem(item) {
        this.items.push(item);
    }
}

// Test array and destructuring syntax
const [first, second, ...rest] = [1, 2, 3, 4, 5];
const {name, value} = objectTest;

// Test template literals and expressions
const template = `Hello ${name}, your value is ${value}!`;

// This file tests:
// 1. Cursor should be a clean line (│) not a block
// 2. Syntax highlighting should be preserved throughout
// 3. Cursor should animate smoothly between positions
// 4. Native VS Code cursor should be completely hidden

export { testCursorAnimation, TestClass }; 