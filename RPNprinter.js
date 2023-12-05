const visitor = {
    visitBinaryExpr: (expr) => `${expr.left.accept(visitor)} ${expr.right.accept(visitor)} ${expr.operator.lexeme}`,
    visitGroupingExpr: (expr) => expr.expression.accept(visitor),
    visitLiteralExpr: (expr) => expr.value == null ? "nil" : expr.value.toString(),
    visitUnaryExpr: (expr) => `${expr.right.accept(visitor)} ${expr.operator.lexeme}`,
}

export default function printRPN(expr) {
    return expr.accept(visitor);
}