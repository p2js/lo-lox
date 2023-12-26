import TokenType from './TokenType.js';
import { runtimeError } from './lox.js';
import Environment from './Environment.js';
import { LoxFunction } from './LoxFunction.js';

export default class Interpreter {
    constructor() {
        this.globals = new Environment();

        this.globals.define('clock', {
            arity: 0,
            call: (interpreter, args) => {
                return Date.now() / 1000;
            },
            toString: () => '<native fn>'
        });

        this.environment = this.globals;
    }

    interpret(statements) {
        let returnValue;
        for (let statement of statements) {
            returnValue = statement.accept(this);
        }
        return returnValue;
    }

    //BLOCKS

    executeBlock(statements, environment) {
        let previous = this.environment;

        let returnValue;

        try {
            this.environment = environment;
            returnValue = this.interpret(statements);
        } finally {
            this.environment = previous;
        }

        return returnValue;
    }

    //STATEMENTS

    visitBlockStmt(stmt) {
        return this.executeBlock(stmt.statements, new Environment(this.environment));
    }

    visitVarStmt(stmt) {
        let value = null;
        if (stmt.initialiser) value = this.evaluate(stmt.initialiser);
        this.environment.define(stmt.name.lexeme, value);
        return null;
    }

    visitIfStmt(stmt) {
        if (isTruthy(this.evaluate(stmt.condition))) {
            return stmt.thenBranch.accept(this);
        } else if (this.elseBranch != null) {
            return stmt.elseBranch.accept(this);
        } else {
            return null;
        }
    }

    visitWhileStmt(stmt) {
        let returnValue = null;
        while (isTruthy(this.evaluate(stmt.condition))) {
            returnValue = stmt.body.accept(this);
        }
        return returnValue;
    }

    visitExpressionStmt(stmt) {
        return this.evaluate(stmt.expression);
    }

    visitFunctionStmt(stmt) {
        let fn = new LoxFunction(stmt);
        this.environment.define(stmt.name.lexeme, fn);
        return null;
    }

    visitPrintStmt(stmt) {
        let value = this.evaluate(stmt.expression);
        if (value == null) value = 'nil';
        console.log(value.toString());
        return null;
    }

    visitReturnStmt(stmt) {
        let value = null;
        if (stmt.value != null) value = this.evaluate(stmt.value)

        throw value;
    }

    //EXPRESSIONS

    evaluate(expr) {
        return expr.accept(this);
    }

    visitAssignExpr(expr) {
        let value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
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

    visitCallExpr(expr) {
        let callee = this.evaluate(expr.callee);
        let args = expr.args.map(arg => this.evaluate(arg));

        if (!callee || (typeof callee.call != 'function')) {
            throw error(expr.paren, 'Attempted to call a non-callable value');
        }

        if (args.length != callee.arity) {
            throw error(expr.paren, `Expected ${callee.arity} arguments but found ${args.length}`)
        }

        return callee.call(this, args);
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

        //unreachable 
        return null;
    }

    visitLogicalExpr(expr) {
        let left = this.evaluate(expr.left);
        switch (expr.operator.type) {
            case TokenType.OR:
                if (isTruthy(left)) return left;
                break;
            case TokenType.AND:
                if (!isTruthy(left)) return left;
                break;
        }
        return this.evaluate(expr.right);
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