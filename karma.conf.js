module.exports = function(config) {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    files: [
      { pattern: "dist/**/*.spec.js", type: "module", included: true },
      { pattern: 'dist/**/*.js', included: false, served: true},
    ],
    exclude: [],
    preprocessors: {},
    reporters: ["spec"],
    port: 10002,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: true,
    concurrency: Infinity
  });
};