const chalk = require("chalk");
const fs = require("fs");
const ncp = require("ncp");
const path = require("path");
const { promisify } = require("util");
const execa = require("execa");
const Listr = require("listr");
const { projectInstall } = require("pkg-install");

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(
    options.templateDirectory,
    `${options.targetDirectory}/${options.projectName}`,
    {
      clobber: false,
    }
  );
}

async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: `${options.targetDirectory}/${options.projectName}`,
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
  return;
}

async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };

  const currentFileUrl = import.meta.url;

  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    "../../templates",
    options.template.toLowerCase()
  );

  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({
          cwd: `${options.targetDirectory}/${options.projectName}`,
          prefer: "yarn",
        }),
      skip: () =>
        !options.runInstall
          ? "Pass --install to automatically install dependencies"
          : undefined,
    },
    {
      title: "Initialize git",
      task: () => initGit(options),
      enabled: () => true,
    },
  ]);

  await tasks.run();

  console.log("%s Project ready", chalk.green.bold("DONE"));
  return true;
}

module.exports = {
  createProject,
};
