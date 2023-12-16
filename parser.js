import TokenType from './TokenType.js';
import * as Expr from './Expr.js';
import * as Stmt from './Stmt.js';
import { error } from './lox.js';

function parseError(token, message) {
    let where = token.type == TokenType.EOF ? ' at end' : ` at '${token.lexeme}'`;
    error(token.line, where, message);
    return new Error();
}

export default function parse(tokens) {
    let currentToken = 0;

    //HELPERS / BASIC OPERATIONS

    //get current token without advancing
    let peek = _ => tokens[currentToken];
    //get previous character
    let previous = _ => tokens[currentToken - 1];
    //check whether the parser has reached EOF
    let isAtEnd = _ => peek().type == TokenType.EOF;
    //consume and return token
    let advance = _ => {
        if (!isAtEnd()) currentToken++;
        return previous();
    }
    //check whether the current token is a given type
    let check = type => isAtEnd() ? false : (peek().type == type);
    //advance if current token matches one of the given types
    let match = (...types) => {
        for (let type of types) {
            if (check(type)) {
                advance();
                return true;
            }
        }
        return false;
    }
    //consume token if given type, else error
    let expect = (type, message) => {
        if (check(type)) {
            return advance();
        } else {
            throw parseError(peek(), message);
        }
    }
    //syncronise on parse error
    let synchronise = _ => {
        advance();
        while (!isAtEnd()) {
            if (previous().type = TokenType.SEMICOLON) return;

            switch (peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }
            advance();
        }
    }

    //GRAMMAR RULE IMPLEMENTATIONS

    function declaration() {
        try {
            if (match(TokenType.VAR)) return varDeclaration();
            return statement();
        } catch (_) {
            synchronise();
            return null;
        }
    }

    function varDeclaration() {
        let name = expect(TokenType.IDENTIFIER, 'Expected identifier.');
        let initialiser = null;
        if (match(TokenType.EQUAL)) initialiser = expression();

        expect(TokenType.SEMICOLON, 'Expected \';\' after variable declaration.')
        return new Stmt.Var(name, initialiser);
    }

    function statement() {
        if (match(TokenType.PRINT)) return printStatement();
        return expressionStatement();
    }

    function printStatement() {
        let expr = expression();
        expect(TokenType.SEMICOLON, 'Expected \';\' after value.');
        return new Stmt.Print(expr);
    }

    function expressionStatement() {
        let expr = expression();
        expect(TokenType.SEMICOLON, 'Expected \';\' after expression.');
        return new Stmt.Expression(expr);
    }

    function expression() {
        return assignment();
    }

    function assignment() {
        let expr = ternary();

        if (match(TokenType.EQUAL)) {
            let value = assignment();

            if (expr instanceof Expr.Variable) {
                return new Expr.Assign(expr.name, value);
            }

            parseError(previous(), 'Invalid assignment target.');
        }

        return expr;
    }

    function ternary() {
        let left = equality();

        if (match(TokenType.QMARK)) {
            let middle = ternary();
            expect(TokenType.COLON, 'Unterminated ternary expression.');
            let right = ternary();

            left = new Expr.Ternary(left, middle, right);
        }

        return left;
    }

    function equality() {
        let left = comparison();

        while (match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            let operator = previous();
            let right = comparison();
            left = new Expr.Binary(left, operator, right);
        }

        return left;
    }

    function comparison() {
        let left = term();

        while (match(TokenType.GREATER, TokenType.LESS, TokenType.GREATER_EQUAL, TokenType.LESS_EQUAL)) {
            let operator = previous();
            let right = term();
            left = new Expr.Binary(left, operator, right);
        }

        return left;
    }

    function term() {
        let left = factor();

        while (match(TokenType.PLUS, TokenType.MINUS)) {
            let operator = previous();
            let right = factor();
            left = new Expr.Binary(left, operator, right);
        }

        return left;
    }

    function factor() {
        let left = unary();

        while (match(TokenType.STAR, TokenType.SLASH)) {
            let operator = previous();
            let right = unary();
            left = new Expr.Binary(left, operator, right);
        }

        return left;
    }

    function unary() {
        if (match(TokenType.BANG, TokenType.MINUS)) {
            let operator = previous();
            let right = unary();
            return new Expr.Unary(operator, right);
        } else {
            return primary();
        }
    }

    function primary() {
        if (match(TokenType.TRUE)) { return new Expr.Literal(true); }
        if (match(TokenType.FALSE)) { return new Expr.Literal(false); }
        if (match(TokenType.NIL)) { return new Expr.Literal(null); }

        if (match(TokenType.NUMBER, TokenType.STRING)) {
            return new Expr.Literal(previous().literal);
        }

        if (match(TokenType.IDENTIFIER)) {
            return new Expr.Variable(previous());
        }

        if (match(TokenType.LEFT_PAREN)) {
            let expr = expression();
            expect(TokenType.RIGHT_PAREN, 'Expected \')\' after expression.')
            return new Expr.Grouping(expr);
        }

        //unexpected token
        let token = peek();
        throw parseError(token, token.type == TokenType.EOF ? 'Expected token.' : 'Unexpected token.');
    }

    let statements = [];
    while (!isAtEnd()) {
        statements.push(declaration());
    }

    return statements;
}