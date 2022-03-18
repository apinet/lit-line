module.exports = function(config) {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    files: [
      { pattern: "dist/**/*.spec.js" }
  ],
preprocessors: {
    },
    reporters: ["spec"],
    port: 10002,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    singleRun: true,
    concurrency: Infinity
  });
};