var unified = require("unified")
var parse = require("remark-parse")
var stringify = require("remark-stringify")
var vfile = require("to-vfile")
var report = require("vfile-reporter")
var shell = require("shelljs")
var addLineBreaks = require("./addLineBreaks")
var fixHtml = require("./fixHtmlTags")

require("dotenv").config({
  path: `.env`,
})

/**
 * Callback that cleans or converts various HTML tags within
 * markdown files to prevent errors during MDX/JSX processing.
 *
 * @param {object} _ Gatsby api object(this is not used in this plugin)
 * @param {object} pluginOptions Plugin options
 * @param {string} pluginOptions.localProjectDir The absolute path to a local doc project
 * @param {string} pluginOptions.optionalTags Additional tags to clean/replace with markdown
 */
exports.onPreInit = (_, pluginOptions) => {
  const { localProjectDir, optionalTags } = pluginOptions
  const files = shell.ls("-Rl", `${localProjectDir}/**/*.md`)

  for (const file of files) {
    if (file.isFile()) {
      formatMarkdown(file)
      fixHtmlTags(file, optionalTags)
    }
  }
}

/**
 * Adds proper line breaks below HTML/JSX tags so they can be processed correctly
 * within fixHtmlTags().
 *
 * @param {object} file  Markdown file from the local GitHub repo for your docs.
 */
function formatMarkdown(file) {
  unified()
    .use(parse)
    .use(addLineBreaks)
    .use(stringify)
    .process(vfile.readSync(`${file.name}`), function(err, file) {
      console.error(report(err || file))
      if (file) {
        vfile.writeSync(file)
      }
    })
}

/**
 * Fixes HTML/JSX tags by transforming HTML into markdown or adding closing tags as needed.
 *
 * @param {object} file  Markdown file from the local GitHub repo for your docs.
 */
function fixHtmlTags(file, optionalTags) {
  unified()
    .use(parse)
    .use(fixHtml, optionalTags)
    .use(stringify)
    .process(vfile.readSync(`${file.name}`), function(err, file) {
      console.error(report(err || file))
      if (file) {
        vfile.writeSync(file)
      }
    })
}