/**
 * Solidity coverage configuration
 */
module.exports = {
  skipFiles: [
    "test/",
    "mocks/",
  ],
  istanbulFolder: "coverage",
  istanbulReporter: ["html", "json", "lcov", "text", "text-summary"],
  reports: ["lcov"],
  reporterOptions: {
    historyDir: ".coverage_artifacts",
  },
};
