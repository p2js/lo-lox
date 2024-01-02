import Environment from "./Environment.js";

export class LoxFunction {
    constructor(declaration, closure) {
        this.declaration = declaration;
        this.arity = declaration.params.length;
        this.closure = closure;
    }

    call(interpreter, args) {
        let environment = new Environment(this.closure);
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }
        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (returnValue) {
            return returnValue;
        }
    }

    toString() {
        return `<fn ${this.declaration.name.lexeme}>`
    }
}