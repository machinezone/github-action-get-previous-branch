const { exec } = require('child_process');
const fs = require('fs');
const branchPrefix = `${process.env.INPUT_PREFIX || ''}*`;
const workingDirectory = process.env.INPUT_WORKINGDIRECTORY || null;

console.log('\x1b[33m%s\x1b[0m', 'Working directory: ', workingDirectory || '');

exec(`git for-each-ref --sort=-v:refname --count 1 --format="%(refname:short)" "refs/remotes/origin/${branchPrefix}"`, {cwd: workingDirectory}, (err, branch, stderr) => {
    branch = branch.trim();

    if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any branches because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        process.exit(1);
    } else if (branch === "") {
        console.log('\x1b[33m%s\x1b[0m', 'Falling back to default branch');
        console.log('\x1b[32m%s\x1b[0m', `Found branch: ${process.env.INPUT_FALLBACK}`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=${process.env.INPUT_FALLBACK}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${branch.slice(process.env.INPUT_PREFIX.length)}\n`);
        process.exit(0);
    }

    console.log('\x1b[32m%s\x1b[0m', `Found branch: ${branch.slice('origin/'.length)}`);
    console.log('\x1b[32m%s\x1b[0m', `Found version: ${branch.slice(process.env.INPUT_PREFIX.length + 'origin/'.length)}`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=${branch.slice('origin/'.length)}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${branch.slice(process.env.INPUT_PREFIX.length + 'origin/'.length)}\n`);
    process.exit(0);
});
