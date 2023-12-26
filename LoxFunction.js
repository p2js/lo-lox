import Environment from "./Environment.js";

export class LoxFunction {
    constructor(declaration) {
        this.declaration = declaration;
        this.arity = declaration.params.length;
    }

    call(interpreter, args) {
        let environment = new Environment(interpreter.globals);
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