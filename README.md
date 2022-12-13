# GitHub PR Content Checker

This action checks for the presence or absence of a word in the body or diff in a PR, as well as the number of lines and files changed. If fails if one or more of the set criteria isn't met.

# Using this action

You need to add this in a file in `.github/workflows` and set appropriate options.

```
name: "Check PR content"
on: [pull_request]

jobs:
  check_pr:
    runs-on: ubuntu-latest
    steps:
    - name: Check PR
      uses: francesco-giordano/gh-pr-content-checker@develop
      with:
        github-token: ${{github.token}}
        bodyContains: 'Add this'
        bodyDoesNotContain: "Delete this"        
        diffContains: 'Add this'
        diffDoesNotContain: "Delete this"   
        diffContainsRegex: '<regex here>'
        diffDoesNotContainRegex: '<regex here>'
        maxLinesChanged: 1
        maxFilesChanged: 1
```

An example is also provided in .github/workflows/ in this repository.

# Run this action

In order to be able to directly use the action, it needs to be compiled:

```bash
npm install && npm run build && npm run package 
```

## History

This is a customization of [pablo-statsig/gh-pr-content-checker](https://github.com/pablo-statsig/gh-pr-content-checker/), adding label skip

* `v1`: Added logging and label to skip check

## License

This is a modification of [pablo-statsig/gh-pr-content-checker](https://github.com/pablo-statsig/gh-pr-content-checker/) and is released under the MIT license.
