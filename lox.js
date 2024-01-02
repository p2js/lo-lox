import scanTokens from './scanner.js';
import parse from './parser.js';
import Interpreter from './interpreter.js';

import fs from 'fs';
import readline from 'readline';
import { Resolver } from './resolver.js';


let args = process.argv.slice(2);

let hadError = false;
let hadRuntimeError = false;

if (args.length > 1) {
    console.log(`Usage: node lox [script]`);
    process.exit(64);
}

let interpreter = new Interpreter();

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
            case '/clear':
                console.log('\x1bc');
                break;
            case '/exit':
            case '/quit':
                process.exit(0);
            default:
                let finalVal = run(line);
                if (!hadError && !hadRuntimeError) console.log(finalVal == null ? 'nil' : finalVal.toString());
                break;
        }
        hadError = false;
        hadRuntimeError = false;
        process.stdout.write('> ');
    }
}

function run(source) {
    let tokens = scanTokens(source);
    let statements = parse(tokens);
    if (hadError) return;
    (new Resolver(interpreter)).resolveStatements(statements);
    if (hadError) return;
    let finalValue = interpreter.interpret(statements);
    if (hadRuntimeError) return;
    return finalValue;
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