import { LoxFunction } from "./LoxFunction.js";
import { error } from "./lox.js";

export class Resolver {
    constructor(interpreter) {
        this.interpreter = interpreter;
        this.scopes = [];
        this.currentFunction = null;
    }

    beginScope() {
        this.scopes.push(new Map())
    }
    endScope() {
        this.scopes.pop();
    }

    declare(name) {
        if (this.scopes.length == 0) return;
        let scope = this.scopes[this.scopes.length - 1];
        if (scope.has(name.lexeme)) error(name.line, ` at '${name.lexeme}'`, 'Variable already defined');
        scope.set(name.lexeme, false);
    }

    define(name) {
        if (this.scopes.length == 0) return;
        let scope = this.scopes[this.scopes.length - 1];
        scope.set(name.lexeme, true);
    }

    resolveFunction(fn, type) {
        let enclosingFunctionType = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();
        for (let param of fn.params) {
            this.declare(param);
            this.define(param);
        }
        this.resolve(fn.body);
        this.endScope();
        this.currentFunction = enclosingFunctionType;
    }

    resolveStatements(statements) {
        for (let statement of statements) {
            this.resolve(statement);
        }
    }

    resolve(thing) {
        thing.accept(this);
    }

    resolveLocal(expr, name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
            }
        }
    }


    //STATEMENTS

    visitBlockStmt(stmt) {
        this.beginScope();
        this.resolveStatements(stmt.statements);
        this.endScope();
        return null;
    }

    visitVarStmt(stmt) {
        this.declare(stmt.name);
        if (stmt.initialiser != null) this.resolve(stmt.initialiser);
        this.define(stmt.name);

        return null;
    }

    visitFunctionStmt(stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);

        this.resolveFunction(stmt, LoxFunction);
        return null;
    }

    visitExpressionStmt(stmt) {
        this.resolve(stmt.expression);
        return null;
    }

    visitIfStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);
        if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
        return null;
    }

    visitPrintStmt(stmt) {
        this.resolve(stmt.expression);
        return null;
    }

    visitReturnStmt(stmt) {
        if (this.currentFunction == null) {
            error(stmt.keyword.line, ` at '${stmt.keyword.lexeme}'`, 'Cannot return from top-level code');
        }
        if (stmt.value != null) {
            this.resolve(stmt.value);
        }
    }

    visitWhileStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
        return null;
    }

    //EXPRESSIONS

    visitVariableExpr(expr) {
        if ((this.scopes.length != 0) && (this.scopes[this.scopes.length - 1].get(expr.name.lexeme) == false)) {
            error(expr.name.line, ` at '${expr.name.lexeme}'`, "Can't read local variable name in its own initialiser");
        }

        this.resolveLocal(expr, expr.name);
    }

    visitAssignExpr(expr) {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
        return null;
    }

    visitBinaryExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
        return null;
    }

    visitCallExpr(expr) {
        this.resolve(expr.callee);
        for (let argument of expr.args) this.resolve(argument);
        return null;
    }

    visitGroupingExpr(expr) {
        this.resolve(expr.expression);
        return null;
    }

    visitLiteralExpr(expr) {
        return null;
    }

    visitLogicalExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
        return null;
    }

    visitUnaryExpr(expr) {
        this.resolve(expr.right);
        return null;
    }
}