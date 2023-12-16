import { runtimeError } from './lox.js';

export default class Environment {
    constructor() {
        this.values = new Map();
    }

    get(name) {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }

        runtimeError(name.line, ' at ' + name.lexeme, 'Variable not defined.');
    }

    define(name, value) {
        this.values.set(name, value);
    }

    assign(name, value) {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
        } else {
            runtimeError(name.line, ' at ' + name.lexeme, 'Variable not defined.');
        }
    }
}