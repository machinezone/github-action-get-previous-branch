const { exec } = require('child_process');
const fs = require('fs');
const branchPrefix = `${process.env.INPUT_PREFIX || ''}*`;
const workingDirectory = process.env.INPUT_WORKINGDIRECTORY || null;

console.log('\x1b[33m%s\x1b[0m', 'Working directory: ', workingDirectory || '');

exec(`git for-each-ref --sort=-v:refname --format="%(refname:short)" "refs/remotes/origin/${branchPrefix}"`, {cwd: workingDirectory}, (err, branches, stderr) => {
    branches = branches.trim();
    if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any branches because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        process.exit(1);
    } else if (branches === "") {
        console.log('\x1b[33m%s\x1b[0m', 'Falling back to default branch');
        console.log('\x1b[32m%s\x1b[0m', `Found branch: ${process.env.INPUT_FALLBACK}`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=${process.env.INPUT_FALLBACK}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${process.env.INPUT_FALLBACK.slice(process.env.INPUT_PREFIX.length)}\n`);
        process.exit(0);
    }

    var branchList = branches.split('\n')
    branchList.forEach((branch, index) => branchList[index] = branch.slice('origin/'.length));
    if (!process.env.INPUT_LIMIT) {
        console.log('\x1b[32m%s\x1b[0m', `Found branch: ${branchList[0]}`);
        console.log('\x1b[32m%s\x1b[0m', `Found version: ${branchList[0].slice(process.env.INPUT_PREFIX.length)}`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=${branchList[0]}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${branchList[0].slice(process.env.INPUT_PREFIX.length)}\n`);
        process.exit(0);
    }

    var limitVersion = process.env.INPUT_LIMIT.slice(process.env.INPUT_PREFIX.length)

    // Loop through branch list and return highest branch below the limit branch
    for (var i = 0; i < branchList.length; i++) {
        var branchVersion = branchList[i].slice(process.env.INPUT_PREFIX.length)
        if (limitVersion.localeCompare(branchVersion, undefined, { numeric: true, sensitivity: 'base' }) == 1) {
            console.log('\x1b[32m%s\x1b[0m', `Found branch: ${branchList[i]}`);
            console.log('\x1b[32m%s\x1b[0m', `Found version: ${branchVersion}`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=${branchList[i]}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${branchVersion}\n`);
            process.exit(0);
        }
    }

    // In the event in which branches were found but no branches were below the requested limit, we return empty strings
    console.log('\x1b[32m%s\x1b[0m', `Returning empty branch`);
    console.log('\x1b[32m%s\x1b[0m', `Returning empty version`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=""\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=""\n`);
    process.exit(0);
});
