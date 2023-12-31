export class Assign {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    accept(visitor) {
        return visitor.visitAssignExpr(this);
    }
}

export class Ternary {
    constructor(left, middle, right) {
        this.left = left;
        this.middle = middle;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitTernaryExpr(this);
    }
}

export class Logical {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitLogicalExpr(this);
    }
}

export class Binary {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}

export class Call {
    constructor(callee, paren, args) {
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }

    accept(visitor) {
        return visitor.visitCallExpr(this);
    }
}

export class Grouping {
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}

export class Literal {
    constructor(value) {
        this.value = value;
    }

    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

export class Unary {
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}

export class Variable {
    constructor(name) {
        this.name = name;
    }

    accept(visitor) {
        return visitor.visitVariableExpr(this);
    }
}

