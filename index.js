const core = require('@actions/core');
const wait = require('./wait');
const github = require('@actions/github')
const parse = require('parse-diff')

// most @actions toolkit packages have async methods
async function run() {

  core.debug("test")
  // get information on everything
  const token = core.getInput('github-token', { required: true })
  const octokit = github.getOctokit(token);
  const context = github.context;
  //const payload = ((context.eventName === 'push') ? context.payload.push : context.payload.pull_request);
  core.debug(context.eventName)

}

run();
