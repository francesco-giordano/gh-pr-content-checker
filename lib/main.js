"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const core = require('@actions/core');
const github = require('@actions/github');
const parse = require('parse-diff');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.info("Checking the PR");
            core.debug("Get context");
            // get information on everything
            const token = core.getInput('github-token', { required: true });
            const octokit = github.getOctokit(token);
            const context = github.context;
            core.debug("Check if it is a pull_request");
            const event = context.eventName;
            if (event !== 'pull_request') {
                core.setFailed("This is not a PullRequest. It is a " + event);
                return;
            }
            core.debug("Check body contains");
            // Check that the pull request description contains the required string
            const bodyContains = core.getInput('bodyContains');
            if (bodyContains && !context.payload.pull_request.body.includes(bodyContains)) {
                core.setFailed("The PR description should include " + bodyContains);
            }
            core.debug("Check body does not contain");
            // Check that the pull request description does not contain the forbidden string
            const bodyDoesNotContain = core.getInput('bodyDoesNotContain');
            if (bodyDoesNotContain && context.payload.pull_request.body.includes(bodyDoesNotContain)) {
                core.setFailed("The PR description should not include " + bodyDoesNotContain);
            }
            core.debug("Get diff");
            // Request the pull request diff from the GitHub API
            const { data: prDiff } = yield octokit.pulls.get({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: context.payload.pull_request.number,
                mediaType: {
                    format: "diff",
                },
            });
            const files = parse(prDiff);
            core.debug("Check max files changed");
            // Check that no more than the specified number of files were changed
            const maxFilesChanged = core.getInput('maxFilesChanged');
            if (maxFilesChanged && files.length > maxFilesChanged) {
                core.setFailed("The PR should not change more than " + maxFilesChanged + " file(s)");
            }
            // Get changed chunks
            var changes = '';
            var additions = 0;
            files.forEach(function (file) {
                additions += file.additions;
                file.chunks.forEach(function (chunk) {
                    chunk.changes.forEach(function (change) {
                        if (change.add) {
                            changes += change.content;
                        }
                    });
                });
            });
            core.debug('pabbelt:' + changes);
            core.debug("Check max lines changed");
            // Check that no more than the specified number of lines have changed
            const maxLinesChanged = +core.getInput('maxLinesChanged');
            if (maxLinesChanged && (additions > maxLinesChanged)) {
                core.setFailed("The PR shouldn not change more than " + maxLinesChanged + " lines(s) ");
            }
            core.debug("Check diff contains");
            // Check that the pull request diff contains the required string
            const diffContains = core.getInput('diffContains');
            if (diffContains && !changes.includes(diffContains)) {
                core.setFailed("The PR diff should include " + diffContains);
            }
            core.debug("Check diff does not contain");
            // Check that the pull request diff does not contain the forbidden string
            const diffDoesNotContain = core.getInput('diffDoesNotContain');
            if (diffDoesNotContain && changes.includes(diffDoesNotContain)) {
                core.setFailed("The PR diff should not include " + diffDoesNotContain);
            }
            core.debug("Check diff contains regex");
            // Check that the pull request diff contains the required regex
            const diffContainsRegex = core.getInput('diffContainsRegex');
            if (diffContainsRegex && !RegExp(diffContainsRegex).test(changes)) {
                core.setFailed("The PR diff should include a string matching " + diffContainsRegex);
            }
            core.debug("Check diff does not contain regex");
            // Check that the pull request diff does not contain the forbidden regex
            const diffDoesNotContainRegex = core.getInput('diffDoesNotContainRegex');
            if (diffDoesNotContainRegex && RegExp(diffDoesNotContainRegex).test(changes)) {
                core.setFailed("The PR diff should not include a string matching " + diffDoesNotContainRegex);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
