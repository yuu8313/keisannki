class Calculator {
    constructor() {
        this.memory = 0;
        this.currentNumber = '0';
        this.previousNumber = '';
        this.operation = null;
        this.history = [];
        this.hasDecimal = false;
        this.unitConversion = {
            current: 'none',
            from: 'base',
            to: 'base'
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupUnitConverters();
    }

    initializeElements() {
        this.displayResult = document.getElementById('result');
        this.displayExpression = document.getElementById('expression');
        this.displayHistory = document.getElementById('history');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.updateDisplay();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const value = button.dataset.value;
                
                if (action) {
                    this.handleAction(action);
                } else if (value) {
                    this.appendNumber(value);
                }
            });
        });
    }

    setupUnitConverters() {
        const unitTypes = {
            data: {
                units: ['B', 'KB', 'MB', 'GB', 'TB'],
                multiplier: 1024
            },
            length: {
                units: ['mm', 'cm', 'm', 'km'],
                multiplier: 10
            },
            weight: {
                units: ['mg', 'g', 'kg', 't'],
                multiplier: 1000
            }
        };

        const unitType = document.getElementById('unitType');
        const unitFrom = document.getElementById('unitFrom');
        const unitTo = document.getElementById('unitTo');

        unitType.addEventListener('change', (e) => {
            const type = e.target.value;
            this.unitConversion.current = type;
            
            if (type === 'none') {
                unitFrom.innerHTML = '<option value="base">-</option>';
                unitTo.innerHTML = '<option value="base">-</option>';
                return;
            }

            const units = unitTypes[type].units;
            const fromOptions = units.map(unit => 
                `<option value="${unit}">${unit}</option>`
            ).join('');
            const toOptions = fromOptions;

            unitFrom.innerHTML = fromOptions;
            unitTo.innerHTML = toOptions;
        });

        [unitFrom, unitTo].forEach(select => {
            select.addEventListener('change', () => {
                this.unitConversion.from = unitFrom.value;
                this.unitConversion.to = unitTo.value;
                this.convertUnit();
            });
        });
    }

    handleKeyboard(e) {
        const key = e.key;
        
        if (e.ctrlKey || e.metaKey) {
            return;
        }

        if (/[0-9.]/.test(key) || ['+', '-', '*', '/', 'Enter', 'Backspace', 'Escape'].includes(key)) {
            e.preventDefault();
            
            if (/[0-9.]/.test(key)) {
                this.appendNumber(key);
            } else {
                switch(key) {
                    case '+': this.handleAction('add'); break;
                    case '-': this.handleAction('subtract'); break;
                    case '*': this.handleAction('multiply'); break;
                    case '/': this.handleAction('divide'); break;
                    case 'Enter': this.handleAction('calculate'); break;
                    case 'Backspace': this.handleAction('backspace'); break;
                    case 'Escape': this.handleAction('clear'); break;
                }
            }
        }
    }

    appendNumber(number) {
        if (number === '.' && this.hasDecimal) return;
        if (number === '.') this.hasDecimal = true;
        
        if (this.currentNumber === '0' && number !== '.') {
            this.currentNumber = number;
        } else {
            this.currentNumber += number;
        }
        
        this.updateDisplay();
    }

    handleAction(action) {
        switch(action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.setOperation(action);
                break;
            case 'calculate':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'toggle-sign':
                this.toggleSign();
                break;
            case 'sqrt':
                this.sqrt();
                break;
            case 'mc':
                this.memoryClear();
                break;
            case 'mr':
                this.memoryRecall();
                break;
            case 'ms':
                this.memoryStore();
                break;
            case 'm-plus':
                this.memoryAdd();
                break;
            case 'm-minus':
                this.memorySubtract();
                break;
        }
    }

    setOperation(operation) {
        if (this.operation !== null) {
            this.calculate();
        }
        
        this.operation = operation;
        this.previousNumber = this.currentNumber;
        this.currentNumber = '0';
        this.hasDecimal = false;
        this.updateDisplay();
    }

    calculate() {
        if (!this.operation || !this.previousNumber) return;

        const prev = parseFloat(this.previousNumber);
        const current = parseFloat(this.currentNumber);
        let result;

        switch(this.operation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('0で割ることはできません');
                    return;
                }
                result = prev / current;
                break;
        }

        const expression = `${prev} ${this.getOperationSymbol()} ${current} = ${result}`;
        this.history.push(expression);
        this.updateHistory();

        this.currentNumber = result.toString();
        this.operation = null;
        this.previousNumber = '';
        this.hasDecimal = this.currentNumber.includes('.');
        this.updateDisplay();
    }

    getOperationSymbol() {
        switch(this.operation) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    clear() {
        this.currentNumber = '0';
        this.previousNumber = '';
        this.operation = null;
        this.hasDecimal = false;
        this.updateDisplay();
    }

    backspace() {
        if (this.currentNumber.length === 1) {
            this.currentNumber = '0';
        } else {
            if (this.currentNumber.slice(-1) === '.') {
                this.hasDecimal = false;
            }
            this.currentNumber = this.currentNumber.slice(0, -1);
        }
        this.updateDisplay();
    }

    toggleSign() {
        this.currentNumber = (parseFloat(this.currentNumber) * -1).toString();
        this.updateDisplay();
    }

    sqrt() {
        const num = parseFloat(this.currentNumber);
        if (num < 0) {
            this.showError('負の数の平方根は計算できません');
            return;
        }
        this.currentNumber = Math.sqrt(num).toString();
        this.updateDisplay();
    }

    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        this.currentNumber = this.memory.toString();
        this.updateDisplay();
    }

    memoryStore() {
        this.memory = parseFloat(this.currentNumber);
        this.updateMemoryIndicator();
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentNumber);
        this.updateMemoryIndicator();
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentNumber);
        this.updateMemoryIndicator();
    }

    convertUnit() {
        if (this.unitConversion.current === 'none' ||
            this.unitConversion.from === 'base' ||
            this.unitConversion.to === 'base') {
            return;
        }

        const value = parseFloat(this.currentNumber);
        const result = this.convertBetweenUnits(
            value,
            this.unitConversion.from,
            this.unitConversion.to,
            this.unitConversion.current
        );

        this.currentNumber = result.toString();
        this.updateDisplay();
    }

    convertBetweenUnits(value, fromUnit, toUnit, type) {
        const unitTypes = {
            data: { multiplier: 1024, units: ['B', 'KB', 'MB', 'GB', 'TB'] },
            length: { multiplier: 10, units: ['mm', 'cm', 'm', 'km'] },
            weight: { multiplier: 1000, units: ['mg', 'g', 'kg', 't'] }
        };

        const { multiplier, units } = unitTypes[type];
        const fromIndex = units.indexOf(fromUnit);
        const toIndex = units.indexOf(toUnit);
        const difference = fromIndex - toIndex;

        return value * Math.pow(multiplier, difference);
    }

    updateDisplay() {
        this.displayResult.textContent = this.currentNumber;
        this.displayExpression.textContent = this.previousNumber + 
            (this.operation ? ` ${this.getOperationSymbol()} ` : '');
    }

    updateHistory() {
        this.displayHistory.innerHTML = this.history
            .slice(-3)
            .map(item => `<div>${item}</div>`)
            .join('');
    }

    updateMemoryIndicator() {
        this.memoryIndicator.textContent = this.memory !== 0 ? 'M' : '';
    }

    showError(message) {
        this.displayResult.textContent = message;
        setTimeout(() => this.updateDisplay(), 2000);
    }
}

new Calculator();