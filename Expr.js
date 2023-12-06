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

