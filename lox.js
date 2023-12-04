import scanTokens from './scanner.js';

import fs from 'fs';
import readline from 'readline';

let args = process.argv.slice(2);

console.log(process.argv);

if (args.length > 1) {
    console.log(`Usage: node lox [script]`);
    process.exit(64);
}
if (args.length == 1) {
    runFile(args[0]);
} else {
    runPrompt();
}

let hadError = false;

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
}

async function runPrompt() {
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
            default:
                run(line);
                break;
        }
        console.log(hadError);
        hadError = false;
        process.stdout.write("> ");
    }
}

function run(source) {
    let tokens = scanTokens(source);

    for (const token of tokens) {
        console.log(token);
    }
}

function report(line, where, message) {
    console.log(`[Line ${line}] Error${where}: ${message}`);
    hadError = true;
}

export function error(line, message) {
    report(line, "", message);
}