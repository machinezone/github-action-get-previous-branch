# Get previous branch

GitHub Action that gets the latest versioned branch from Git

This builds on top of Cees-Jan Kiewiet's get-previous-tag action to perform similar actions for versioned branches (not tags).
The other other major difference is that it considers the semantic versioning of the branch and not the timestamp.

![Example output showing this action in action](images/output.png)

## Input

By default, this action will fail if no branch can be found, however, it accepts a `fallback` branch that will be used when no 
branch can be found. Keep in mind that when this action is used in a workflow that has no `.git` directory, it will still 
fail, and the fallback branch isn't used.  It is also accepts a `prefix` string to query the branch based on it. And finally 
it takes a `workingDirectory` if you need to look for a branch in an alternative path.

* `fallback`: `1.0.0`
* `prefix`: `branch-prefix`
* `workingDirectory`: `another/path/where/a/git/repo/is/checked/out`

## Output

This action has two outputs, `branch` for the found branch, or the fallback. And, `version` as version string (which is just
the branch with the prefix removed). Note that the prefix input should include any `/` that would be part of your full branch name.

* `branch`: `prefix1.2.3`
* `version`: `1.2.3`

## Example

Find more examples in the [examples directory](./examples/).

The following example works together with the [`WyriHaximus/github-action-next-semvers`](https://github.com/marketplace/actions/next-semvers) and [`WyriHaximus/github-action-create-milestone`](https://github.com/marketplace/actions/create-milestone) actions.
Where it provides the previous branch version  from that action so it can supply a set of versions for the next action, which creates a new milestone.
(This snippet has been taken from the automatic code generation of [`wyrihaximus/fake-php-version`](https://github.com/wyrihaximus/php-fake-php-version/).)

```yaml
name: Generate
jobs:
  generate:
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Required due to the way Git works, without it this action won't be able to find any or the correct branch
      - name: 'Get Previous branch'
        id: previousbranch
        uses: "machinezone/github-action-get-previous-branch@v1"
        with:
          fallback: 1.0.0 # Optional fallback branch to use when no branch can be found
          #workingDirectory: another/path/where/a/git/repo/is/checked/out # Optional alternative working directory
      - name: 'Get next minor version'
        id: semvers
        uses: "WyriHaximus/github-action-next-semvers@v1"
        with:
          version: ${{ steps.previousbranch.outputs.version }}
      - name: 'Create new milestone'
        id: createmilestone
        uses: "WyriHaximus/github-action-create-milestone@v1"
        with:
          title: ${{ steps.semvers.outputs.patch }}
        env:
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```

## License ##

Copyright 2021 [Cees-Jan Kiewiet](http://wyrihaximus.net/)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
