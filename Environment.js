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
}