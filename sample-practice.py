# Sample Python file for ReType typing practice
# Position your cursor anywhere and start practicing!

def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# List comprehensions and common Python patterns
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = [x**2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

# Dictionary operations
students = {
    'Alice': {'age': 20, 'grade': 'A'},
    'Bob': {'age': 21, 'grade': 'B'},
    'Charlie': {'age': 19, 'grade': 'A+'}
}

# Filter students with grade A or better
top_students = {name: info for name, info in students.items() 
               if info['grade'] in ['A', 'A+']}

# Exception handling
def divide_numbers(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("Cannot divide by zero!")
        return None
    except TypeError:
        print("Invalid input types!")
        return None

# Practice typing these Python-specific constructs:
# - Indentation-based code blocks
# - List/dict comprehensions  
# - f-strings and string formatting
# - Exception handling with try/except
# - Class definitions and methods
# - Lambda functions and functional programming

lambda_square = lambda x: x**2
mapped_squares = list(map(lambda_square, numbers))

print(f"Original numbers: {numbers}")
print(f"Squared numbers: {mapped_squares}")

# Happy coding and typing! 