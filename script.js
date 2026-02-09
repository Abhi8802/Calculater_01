class Calculator {
    constructor() {
        // DOM Elements
        this.displayElement = document.getElementById('display');
        this.expressionElement = document.getElementById('expression');
        
        // Calculator State
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.expression = '';
        this.shouldResetDisplay = false;
        this.lastResult = null;
        
        // Initialize
        this.init();
    }

    init() {
        // Button Click Event Listeners
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => this.handleButtonClick(button));
        });

        // Keyboard Event Listener
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Initial Display
        this.updateDisplay();
    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const number = button.dataset.number;

        if (number !== undefined) {
            this.inputNumber(number);
        } else if (action) {
            this.handleAction(action);
        }
    }

    handleAction(action) {
        const actions = {
            'clear': () => this.clear(),
            'delete': () => this.delete(),
            'decimal': () => this.inputDecimal(),
            'percent': () => this.percent(),
            'add': () => this.setOperation('+'),
            'subtract': () => this.setOperation('−'),
            'multiply': () => this.setOperation('×'),
            'divide': () => this.setOperation('÷'),
            'equals': () => this.calculate()
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    inputNumber(num) {
        // Clear error state
        this.displayElement.classList.remove('error');

        // Reset display if needed
        if (this.shouldResetDisplay) {
            this.currentValue = num;
            this.shouldResetDisplay = false;
        } else {
            // Replace initial 0 or append number
            if (this.currentValue === '0') {
                this.currentValue = num;
            } else {
                // Limit input length
                if (this.currentValue.length < 12) {
                    this.currentValue += num;
                }
            }
        }

        this.updateDisplay();
    }

    inputDecimal() {
        // Clear error state
        this.displayElement.classList.remove('error');

        if (this.shouldResetDisplay) {
            this.currentValue = '0.';
            this.shouldResetDisplay = false;
        } else {
            // Only add decimal if not already present
            if (!this.currentValue.includes('.')) {
                this.currentValue += '.';
            }
        }

        this.updateDisplay();
    }

    setOperation(op) {
        // Clear error state
        this.displayElement.classList.remove('error');

        // If there's a pending operation, calculate first
        if (this.operation && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.operation = op;
        this.previousValue = this.currentValue;
        this.expression = `${this.formatNumber(this.currentValue)} ${op}`;
        this.shouldResetDisplay = true;
        
        this.updateDisplay();
    }

    calculate() {
        if (!this.operation || this.previousValue === '') {
            return;
        }

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        try {
            // Perform calculation based on operation
            switch (this.operation) {
                case '+':
                    result = prev + current;
                    break;
                case '−':
                    result = prev - current;
                    break;
                case '×':
                    result = prev * current;
                    break;
                case '÷':
                    // Division by zero error handling
                    if (current === 0) {
                        throw new Error('Cannot divide by zero');
                    }
                    result = prev / current;
                    break;
                default:
                    return;
            }

            // Check for invalid results
            if (!isFinite(result)) {
                throw new Error('Invalid calculation');
            }

            // Handle very large or very small numbers
            if (Math.abs(result) > 1e12) {
                result = result.toExponential(5);
            } else {
                // Round to avoid floating point errors
                result = Math.round(result * 1e10) / 1e10;
            }

            // Update expression to show complete calculation
            this.expression = `${this.formatNumber(this.previousValue)} ${this.operation} ${this.formatNumber(this.currentValue)} =`;
            
            // Update values
            this.currentValue = result.toString();
            this.lastResult = result;
            this.previousValue = '';
            this.operation = null;
            this.shouldResetDisplay = true;

        } catch (error) {
            this.handleError(error.message);
        }

        this.updateDisplay();
    }

    percent() {
        const num = parseFloat(this.currentValue);
        
        if (isNaN(num)) {
            return;
        }

        this.currentValue = (num / 100).toString();
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.expression = '';
        this.shouldResetDisplay = false;
        this.displayElement.classList.remove('error');
        this.updateDisplay();
    }

    delete() {
        // Clear error state
        this.displayElement.classList.remove('error');

        if (this.currentValue.length > 1 && this.currentValue !== '0') {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }

        this.updateDisplay();
    }

    handleError(message) {
        console.error('Calculator Error:', message);
        this.currentValue = 'Error';
        this.expression = message;
        this.displayElement.classList.add('error');
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return num;
        
        // Add thousand separators for large numbers
        if (Math.abs(number) >= 1000) {
            return number.toLocaleString('en-US', {
                maximumFractionDigits: 8
            });
        }
        
        return num;
    }

    updateDisplay() {
        this.displayElement.textContent = this.formatNumber(this.currentValue);
        this.expressionElement.textContent = this.expression;
    }

    // Keyboard Input Handler
    handleKeyboard(e) {
        // Prevent default for certain keys
        if (['/', '*', '-', '+', '=', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }

        // Clear error on any input
        if (this.currentValue === 'Error') {
            this.clear();
        }

        // Number keys (0-9)
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        }

        // Decimal point
        if (e.key === '.' || e.key === ',') {
            this.inputDecimal();
        }

        // Operations
        const operationKeys = {
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            '/': 'divide',
            '%': 'percent'
        };

        if (operationKeys[e.key]) {
            this.handleAction(operationKeys[e.key]);
        }

        // Calculate
        if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        }

        // Delete
        if (e.key === 'Backspace') {
            this.delete();
        }

        // Clear
        if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            this.clear();
        }
    }
}

// Initialize Calculator
const calculator = new Calculator();