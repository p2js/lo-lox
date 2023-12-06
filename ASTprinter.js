let parenthesize = (name, ...exprs) => {
    return `(${name} ${exprs.map(e => e.accept(visitor)).join(' ')})`;
};

const visitor = {
    visitTernaryExpr: (expr) => parenthesize('?:', expr.left, expr.middle, expr.right),
    visitBinaryExpr: (expr) => parenthesize(expr.operator.lexeme, expr.left, expr.right),
    visitGroupingExpr: (expr) => parenthesize('group', expr.expression),
    visitLiteralExpr: (expr) => expr.value == null ? "nil" : expr.value.toString(),
    visitUnaryExpr: (expr) => parenthesize(expr.operator.lexeme, expr.right)
}

export default function prettyPrint(expr) {
    return expr.accept(visitor);
}