const core = require('@actions/core');
const wait = require('./wait');
const github = require('@actions/github')
const parse = require('parse-diff')

// most @actions toolkit packages have async methods
async function run() {
  try {
    core.debug("Get github token------")
    // get information on everything
    const token = core.getInput('github-token', { required: true })
    const octokit = github.getOctokit(token);
    const context = github.context;
    const payload = ((context.eventName === 'push') ? context.payload.push : context.payload.pull_request);
    core.debug("print");
    core.debug(payload);

    core.debug("Check body contains")
    // Check that the pull request description contains the required string
    const bodyContains = core.getInput('bodyContains')
    if (typeof bodyContains !== 'undefined') {
      if (bodyContains && !payload.body.includes(bodyContains)) {
        core.setFailed("The PR description should include " + bodyContains)
      }
    }

    core.debug("Check body does not contain")
    // Check that the pull request description does not contain the forbidden string
    const bodyDoesNotContain = core.getInput('bodyDoesNotContain')
    if (typeof bodyDoesNotContain !== 'undefined') {
      if (bodyDoesNotContain && payload.body.includes(bodyDoesNotContain)) {
        core.setFailed("The PR description should not include " + bodyDoesNotContain);
      }
    }

    core.debug("Get diff from github PR")
    // Request the pull request diff from the GitHub API
    const { data: prDiff } = await octokit.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: payload.number,
      mediaType: {
        format: "diff",
      },
    });
    const files = parse(prDiff)

    core.debug("Check max files changed")
    // Check that no more than the specified number of files were changed
    const maxFilesChanged = parseInt(core.getInput('maxFilesChanged'))
    if (typeof maxFilesChanged !== 'undefined') {
      if (maxFilesChanged && files.length > maxFilesChanged) {
        core.setFailed("The PR shouldn not change more than " + maxFilesChanged + " file(s)");
      }
    }

    // Get changed chunks
    var changes = ''
    var additions = 0
    files.forEach(function (file) {
      additions += file.additions
      file.chunks.forEach(function (chunk) {
        chunk.changes.forEach(function (change) {
          if (change.add) {
            changes += change.content
          }
        })
      })
    })
    
    core.debug('pabbelt:', changes)

    core.debug("Check max lines changed")
    // Check that no more than the specified number of lines have changed
    const maxLinesChanged = parseInt(core.getInput('maxLinesChanged'))
    if (typeof maxLinesChanged !== 'undefined') {
      if (maxLinesChanged && (additions > maxLinesChanged)) {
        core.setFailed("The PR shouldn not change more than " + maxLinesChanged + " lines(s) ");
      }
    }

    // Check that the pull request diff constains the required string
    const diffContains = core.getInput('diffContains')
    if (typeof diffContains !== 'undefined') {
      if (diffContains && !changes.includes(diffContains)) {
        core.setFailed("The PR diff should include " + diffContains);
      }
    }

    // Check that the pull request diff does not contain the forbidden string
    const diffDoesNotContain = core.getInput('diffDoesNotContain')
    if (typeof diffDoesNotContain !== 'undefined') {
      if (diffDoesNotContain && changes.includes(diffDoesNotContain)) {
        core.setFailed("The PR diff should not include " + diffDoesNotContain);
      }
    }

    // Check that the pull request diff constains the required regex
    const diffContainsRegex = core.getInput('diffContainsRegex')
    if (typeof diffContainsRegex !== 'undefined') {
      if (diffContains && !RegExp(diffContainsRegex).test(changes)) {
        core.setFailed("The PR diff should include a string matching" + diffContainsRegex);
      }
    }

    // Check that the pull request diff does not contain the forbidden regex
    const diffDoesNotContainRegex = core.getInput('diffDoesNotContainRegex')
    if (typeof diffDoesNotContainRegex !== 'undefined') {
      if (diffDoesNotContain && RegExp(diffDoesNotContainRegex).test(changes)) {
        core.setFailed("The PR diff should not include a string matching" + diffDoesNotContainRegex);
      }
    }

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run();
