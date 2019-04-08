// @flow

const { startsWith } = require("lodash/fp");
const { dirname, relative } = require("path");

module.exports = {
  minimumVersion: "2.10.0",
  useRelativePaths: true,

  environments: ["node", "jest"],
  declarationKeyword: "import", // Node environment changed the default value

  excludes: ["./dist/**", "./es/**", "./lib/**"],

  importStatementFormatter({ importStatement }) {
    // Use double quotes
    return importStatement.replace(/'/g, '"');
  }
};
