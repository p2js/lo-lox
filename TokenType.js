import Enum from './util/enum.js';

let tokenList = [
    //single-character tokens
    "LEFT_PAREN",
    "RIGHT_PAREN",
    "LEFT_BRACE",
    "RIGHT_BRACE",
    "COMMA",
    "DOT",
    "MINUS",
    "PLUS",
    "SEMICOLON",
    "COLON",
    "SLASH",
    "STAR",
    "QMARK",
    //single-or-double-character tokens
    "BANG",
    "BANG_EQUAL",
    "EQUAL",
    "EQUAL_EQUAL",
    "GREATER",
    "GREATER_EQUAL",
    "LESS",
    "LESS_EQUAL",
    //literals
    "IDENTIFIER",
    "STRING",
    "NUMBER",
    //reserved keywords
    "AND",
    "CLASS",
    "ELSE",
    "FALSE",
    "FUN",
    "FOR",
    "IF",
    "NIL",
    "OR",
    "PRINT",
    "RETURN",
    "SUPER",
    "THIS",
    "TRUE",
    "VAR",
    "WHILE",
    //EOF
    "EOF"
];

export default Enum(tokenList);