// Special Characters Test File for ReType
// This file tests handling of various special characters that used to cause issues

// Test quotes and string literals
const message = "Hello World!";
const singleQuote = 'This is a test';
const backticksTemplate = `Template literal with ${message}`;

// Test special punctuation
const items = ["first", "second", "third"];
console.log("Items:", items);

// Test various quote types (if your system auto-converts them)
const fancyQuotes = "Smart quotes";
const moreQuotes = 'More smart quotes';

// Test special characters and symbols
const copyright = "(c) 2024";
const trademark = "(tm)";
const registered = "(r)";
const ellipsis = "Loading...";
const dashes = "em-dash — and en-dash –";

// Test complex strings with mixed characters
function testFunction() {
    const complexString = 'Mix of "quotes" and `backticks` with symbols © ® ™';
    return complexString;
}

// Test escape sequences
const escaped = "Line 1\nLine 2\tTabbed";
const specialChars = "Quotes: \" \' \` Backslash: \\";

// Practice typing these to verify special character handling works correctly!
export { message, testFunction }; 