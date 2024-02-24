module.exports = function(config) {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    files: [
      { pattern: "dist/**/*.spec.js", type: "module" }
  ],
preprocessors: {
    },
    reporters: ["spec"],
    port: 4321,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    singleRun: true,
    concurrency: Infinity
  });
};