export class Block {
    constructor(statements) {
        this.statements = statements;
    }

    accept(visitor) {
        return visitor.visitBlockStmt(this);
    }
}

export class Expression {
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitExpressionStmt(this);
    }
}

export class Print {
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitPrintStmt(this);
    }
}

export class Var {
    constructor(name, initialiser) {
        this.name = name;
        this.initialiser = initialiser;
    }

    accept(visitor) {
        return visitor.visitVarStmt(this);
    }
}

