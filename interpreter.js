import TokenType from './TokenType.js';
import { runtimeError } from './lox.js';

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

const visitor = {
    visitLiteralExpr: (expr) => expr.value,
    visitGroupingExpr: (expr) => evaluate(expr.expression),
    visitUnaryExpr: (expr) => {
        let right = evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !isTruthy(right);
            case TokenType.MINUS:
                return -Number(right);
        }

        //unreachable
        return null;
    },
    visitBinaryExpr: (expr) => {
        let left = evaluate(expr.left);
        let right = evaluate(expr.right);

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
    },
    visitTernaryExpr: (expr) => {
        let left = evaluate(expr.left);
        let middle = evaluate(expr.middle);
        let right = evaluate(expr.right);

        return isTruthy(left) ? middle : right;
    }
};

function error(operator, message) {
    runtimeError(operator.line, ' at ' + operator.lexeme, message);
}

function evaluate(expr) {
    return expr.accept(visitor);
}

export default function interpret(expression) {
    try {
        let value = evaluate(expression);
        if (value == null) return 'nil';
        return value.toString();
    } catch (_) {
        return null;
    }
}