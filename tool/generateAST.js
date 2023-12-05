import fs from 'fs';
import path from 'path';

if (process.argv.length != 3) {
    console.log('Usage: generateAST output_dir');
    process.exit(64);
}

const outputDir = process.argv[2];

//expression types, format := name: [fields]

const exprTypes = {
    Binary: ['left', 'operator', 'right'],
    Grouping: ['expression'],
    Literal: ['value'],
    Unary: ['operator', 'right']
}

writeASTClassFile("Expr", exprTypes);

function writeASTClassFile(baseName, types) {
    //generate source string for output file
    let source = '';

    for (let [name, fields] of Object.entries(types)) {
        let assignmentLines = fields.map(field => `        this.${field} = ${field};`).join('\n');

        source += `export class ${name} {
    constructor(${fields.join(', ')}) {
${assignmentLines}
    }

    accept(visitor) {
        return visitor.visit${name}${baseName}(this);
    }
}

`
    }

    //write source to file
    fs.writeFileSync(path.join(outputDir, `${baseName}.js`), source);
}

