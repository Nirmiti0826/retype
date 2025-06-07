// Sample JavaScript file for ReType typing practice
// Place your cursor at the beginning of any line and start practicing!

function calculateFibonacci(n) {
    if (n <= 1) {
        return n;
    }
    return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const squares = numbers.map(num => num * num);
const evens = numbers.filter(num => num % 2 === 0);

class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    getArea() {
        return this.width * this.height;
    }

    getPerimeter() {
        return 2 * (this.width + this.height);
    }
}

const rect = new Rectangle(10, 5);
console.log(`Area: ${rect.getArea()}`);
console.log(`Perimeter: ${rect.getPerimeter()}`);

// Practice typing these common programming patterns:
// 1. Variable declarations with let, const, var
// 2. Function definitions and arrow functions
// 3. Conditional statements (if, else, switch)
// 4. Loop constructs (for, while, forEach)
// 5. Object and array manipulations
// 6. Template literals and string operations

const users = [
    { name: 'Alice', age: 25, role: 'developer' },
    { name: 'Bob', age: 30, role: 'designer' },
    { name: 'Charlie', age: 35, role: 'manager' }
];

const developers = users
    .filter(user => user.role === 'developer')
    .map(dev => ({ ...dev, seniority: dev.age > 30 ? 'senior' : 'junior' }));

async function fetchUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error;
    }
}

// Happy typing! Remember: accuracy first, speed will follow naturally.