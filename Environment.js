import { runtimeError } from './lox.js';

export default class Environment {
    constructor(enclosing) {
        this.enclosing = enclosing;
        this.values = new Map();
    }

    get(name) {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }

        if (this.enclosing != null) {
            return this.enclosing.get(name);
        }

        runtimeError(name.line, ' at ' + name.lexeme, 'Variable not defined.');
    }

    getAt(distance, name) {
        if (distance == 0) return this.values.get(name);
        return this.enclosing.getAt(distance - 1, name);
    }

    define(name, value) {
        this.values.set(name, value);
    }

    assign(name, value) {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }

        if (this.enclosing != null) {
            this.enclosing.assign(name, value);
            return;
        }

        runtimeError(name.line, ' at ' + name.lexeme, 'Variable not defined.');
    }

    assignAt(distance, name, value) {
        if (distance == 0) return this.values.set(name.lexeme, value);
        return this.enclosing.assignAt(distance - 1, name, value);
    }
}