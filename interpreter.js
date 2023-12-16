import TokenType from './TokenType.js';
import { runtimeError } from './lox.js';
import Environment from './Environment.js';

export default class Interpreter {
    constructor() {
        this.environment = new Environment();
    }

    interpret(statements) {
        try {
            let returnValue;
            for (let statement of statements) {
                returnValue = statement.accept(this);
            }
            return returnValue;
        } catch (ce) {
            console.log('catastrophic error: ' + ce);
            return null;
        }
    }

    //STATEMENTS

    visitVarStmt(stmt) {
        let value = null;
        if (stmt.initialiser) value = this.evaluate(stmt.initialiser);
        this.environment.define(stmt.name.lexeme, value);
        return null;
    }

    visitExpressionStmt(stmt) {
        return this.evaluate(stmt.expression);
    }

    visitPrintStmt(stmt) {
        let value = this.evaluate(stmt.expression);
        if (value == null) value = 'nil';
        console.log(value);
        return null;
    }

    //EXPRESSIONS

    evaluate(expr) {
        return expr.accept(this);
    }

    visitVariableExpr(expr) {
        return this.environment.get(expr.name);
    }

    visitLiteralExpr(expr) {
        return expr.value;
    }

    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }

    visitUnaryExpr(expr) {
        let right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !isTruthy(right);
            case TokenType.MINUS:
                return -Number(right);
        }

        //unreachable
        return null;
    }

    visitBinaryExpr(expr) {
        let left = this.evaluate(expr.left);
        let right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.EQUAL_EQUAL:
                return isEqual(left, right);
            case TokenType.BANG_EQUAL:
                return !isEqual(left, right);
            case TokenType.GREATER:
                checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case TokenType.LESS:
                checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.MINUS:
                checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.STAR:
                checkNumberOperands(expr.operator, left, right);
                return left * right;
            case TokenType.SLASH:
                checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.PLUS: {
                if ((typeof left == 'string' && typeof right == 'string') || (typeof left == 'number' && typeof right == 'number')) {
                    return left + right;
                }

                throw error(expr.operator, 'Operands must be of type number or string');
            }
        }
    }

    visitTernaryExpr(expr) {
        let left = this.evaluate(expr.left);
        let middle = this.evaluate(expr.middle);
        let right = this.evaluate(expr.right);

        return isTruthy(left) ? middle : right;
    }
}

//helper fns

function isTruthy(val) {
    if (val == null) return false;
    if (typeof val == 'boolean') return val;
    return true;
}

function checkNumberOperands(operator, ...vals) {
    for (let val of vals) {
        if (typeof val != 'number') throw error(operator, 'Operand(s) must be of type number');
    }
    return;
}

//in lox, NaN == NaN is true so we have to hack in this logic for equality
function isActuallyNaN(val) {
    return ((typeof val == 'number') && isNaN(val));
}
function isEqual(v1, v2) {
    if (isActuallyNaN(v1) && isActuallyNaN(v2)) return true;
    return ((typeof v1 == typeof v2) && (v1 == v2));
}

function error(operator, message) {
    runtimeError(operator.line, ' at ' + operator.lexeme, message);
}