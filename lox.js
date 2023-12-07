import scanTokens from './scanner.js';
import parse from './parser.js';
import interpret from './interpreter.js';

import fs from 'fs';
import readline from 'readline';


let args = process.argv.slice(2);

let hadError = false;
let hadRuntimeError = false;

if (args.length > 1) {
    console.log(`Usage: node lox [script]`);
    process.exit(64);
}
if (args.length == 1) {
    runFile(args[0]);
} else {
    repl();
}

function runFile(path) {
    let source;
    try {
        source = fs.readFileSync(path, 'utf8');
    } catch (e) {
        console.error(`ERROR: Could not read source path "${path}"`);
        process.exit(64);
    }
    run(source);

    // exit with proper non-zero code if errored
    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
}

async function repl() {
    let rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write("Welcome to lox 1.0.0.\n\n> ");

    for await (const line of rl) {
        //extra command processing
        switch (line) {
            case "/clear":
                console.log('\x1bc');
                break;
            case "/exit":
            case "/quit":
                process.exit(0);
                break;
            default:
                run(line);
                break;
        }
        hadError = false;
        hadRuntimeError = false;
        process.stdout.write("> ");
    }
}

function run(source) {
    console.log('====SCANNER OUTPUT====');
    let tokens = scanTokens(source);
    for (const token of tokens) {
        console.log(token.toString());
    }
    console.log('====PARSER OUTPUT====');
    let expression = parse(tokens);
    if (hadError) return;
    console.log(expression);
    console.log('====INTERPRETER OUTPUT====');
    let value = interpret(expression);
    if (hadRuntimeError) return;
    console.log(value);
}

function report(line, where, message) {
    console.log(`[Line ${line}] Error${where}: ${message}`);
}

export function error(line, where, message) {
    hadError = true;
    report(line, where, message);
}

export function runtimeError(line, where, message) {
    hadRuntimeError = true;
    report(line, where, message);
}