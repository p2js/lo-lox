import TokenType from "./TokenType.js";
import * as expr from "./Expr.js";
import { error } from "./lox.js";

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
    let expect = (type, message) => check(type) ? advance() : parseError(peek(), message);
    //syncronise on parse error
    let syncronise = _ => {
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

    function expression() {
        return equality();
    }

    function equality() {
        let left = comparison();

        while (match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            let operator = previous();
            let right = comparison();
            left = new expr.Binary(left, operator, right);
        }

        return left;
    }

    function comparison() {
        let left = term();

        while (match(TokenType.GREATER, TokenType.LESS, TokenType.GREATER_EQUAL, TokenType.LESS_EQUAL)) {
            let operator = previous();
            let right = term();
            left = new expr.Binary(left, operator, right);
        }

        return left;
    }

    function term() {
        let left = factor();

        while (match(TokenType.PLUS, TokenType.MINUS)) {
            let operator = previous();
            let right = factor();
            left = new expr.Binary(left, operator, right);
        }

        return left;
    }

    function factor() {
        let left = unary();

        while (match(TokenType.STAR, TokenType.SLASH)) {
            let operator = previous();
            let right = unary();
            left = new expr.Binary(left, operator, right);
        }

        return left;
    }

    function unary() {
        if (match(TokenType.BANG, TokenType.MINUS)) {
            let operator = previous();
            let right = unary();
            return new expr.Unary(operator, right);
        } else {
            return primary();
        }
    }

    function primary() {
        if (match(TokenType.TRUE)) { return new expr.Literal(true); }
        if (match(TokenType.FALSE)) { return new expr.Literal(false); }
        if (match(TokenType.NIL)) { return new expr.Literal(null); }

        if (match(TokenType.NUMBER, TokenType.STRING)) {
            return new expr.Literal(previous().literal);
        }

        if (match(TokenType.LEFT_PAREN)) {
            let e = expression();
            expect(TokenType.RIGHT_PAREN, 'Expected \')\' after expression.')
            return new expr.Grouping(e);
        }

        //unexpected token
        parseError(peek(), "Unexpected token.");
    }

    //PARSE BODY
    try {
        return expression();
    } catch (e) {
        return null
    };
}