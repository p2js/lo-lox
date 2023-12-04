import Token from "./Token.js";
import TokenType from "./TokenType.js";
import { error } from "./lox.js";

//map for reserved words
const reservedWords = ["and", "class", "else", "false", "for", "fun", "if", "nil", "or", "print", "return", "super", "this", "true", "var", "while"];
const keywords = new Map();
reservedWords.forEach((w) => { keywords.set(w, TokenType[w.toUpperCase()]); });

function scanTokens(source="") {
    let tokenList = [];

    // keep track of where we are in the source code
    // (current lexeme start character, character, line)
    let start = 0;
    let current = 0;
    let line = 1;

    // helper to know if we have consumed all the characters
    const isAtEnd = _ => current >= source.length;
    // helper to consume and return next character
    const advance = _ => source[current++];
    // helper to add a token to the list
    const addToken = (type, literal = null) => {
        let chunk = source.substring(start, current);
        tokenList.push(new Token(type, chunk, literal, line));
    };
    // helper to conditionally advance if the next token matches
    const match = char => {
        if (isAtEnd() || source[current] != char) return false;
        current++;
        return true;
    }
    // helper to provide one character of lookahead
    const peek = _ => {
        if (isAtEnd()) return '\0';
        return source[current];
    }
    // helper to provide second character of lookahead
    const peekNext = _ => {
        if (current + 1 >= source.length) return '\0';
        return source[current + 1];
    }

    //helper that returns whether a character is a digit
    let isDigit = char => char >= '0' && char <= '9';
    //helper that returns whether the character is a letter or underscore
    let isLetter = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
    //helper that returns whether the character is alphanumeric or underscore
    let isAlphaNumeric = c => isDigit(c) || isLetter(c);

    //function to scan a token
    function scanToken() { 
        let char = advance();
        switch (char) {
            // single-char tokens
            case '(': addToken(TokenType.LEFT_PAREN); break;
            case ')': addToken(TokenType.RIGHT_PAREN); break;
            case '{': addToken(TokenType.LEFT_BRACE); break;
            case '}': addToken(TokenType.RIGHT_BRACE); break;
            case ',': addToken(TokenType.COMMA); break;
            case '.': addToken(TokenType.DOT); break;
            case '-': addToken(TokenType.MINUS); break;
            case '+': addToken(TokenType.PLUS); break;
            case ';': addToken(TokenType.SEMICOLON); break;
            case ':': addToken(TokenType.COLON); break;
            // single-or-double-char tokens
            case '!': addToken(match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
            case '=': addToken(match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
            case '>': addToken(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '<': addToken(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            // division / comments
            case '/':
                if (match('/')) {
                    // comment, goes until the end of the line
                    while (peek() != '\n' && !isAtEnd()) advance();
                } else {
                    addToken(TokenType.SLASH);
                }
                break;
            //string literals
            case '"':
                stringLiteral();
                break;
            //characters to ignore
            case ' ':
            case '\r':
            case '\t':
                break;
            //newlines
            case '\n':
                line++;
                break;
            default:
                if (isDigit(char)) {
                    numberLiteral();
                } else if (isLetter(char)) {
                    identifier();
                } else {
                    error(line, 'Unexpected character "' + char + '".');
                    break;                   
                }
        }
    };

    while (!isAtEnd()) {
        // we are at the beginning of the next lexeme
        start = current;
        scanToken();
    }
    
    tokenList.push(new Token(TokenType.EOF, "", null, line));
    return tokenList;

    // string literal handling
    function stringLiteral() {
        while (peek() != '"' && !isAtEnd()) {
            if (peek() == '\n') line++;
            advance();
        }

        if (isAtEnd()) { // EOF reached, string was unterminated
            error(line, 'Unterminated string');
            return;
        }
        //consume the closing "
        advance();

        //trim quotation marks
        let literalValue = source.substring(start + 1, current - 1);
        addToken(TokenType.STRING, literalValue);
    }

    //number literal handling
    function numberLiteral() {
        while (isDigit(peek())) advance();
        //look for a fractional part
        if (peek() == '.' && isDigit(peekNext())) {
            //consume the decimal point and further digits
            advance();
            while (isDigit(peek())) advance();
        }

        let literalValue = parseFloat(source.substring(start, current));
        addToken(TokenType.NUMBER, literalValue);
    }

    //identifier handling
    function identifier() {
        while (isAlphaNumeric(peek())) advance();

        let word = source.substring(start, current);
        let type = keywords.get(word);
        if (type == undefined) {
            type = TokenType.IDENTIFIER;
        };

        addToken(type);
    }
}

export default scanTokens;