const arg = require("arg");
const inquirer = require("inquirer");
const { createProject } = require("./main.js");
const { usage } = require("./usage.js");

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--help": Boolean,
      "--git": Boolean,
      "--install": Boolean,
      "--template": String,
      "--package-manager": String,

      "-h": "--help",
      "-g": "--git",
      "-i": "--install",
      "-t": "--template",
      "-p": "--package-manager",
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    help: args["--help"] || false,
    template: args["--template"],
    runInstall: args["--install"] || false,
    packageManager: args["--package-manager"],
  };
}

async function promptForMissingOptions(options) {
  const questions = [];
  const templateChoices = ["graphql", "rest"];
  const packageManagerChoices = ["npm", "yarn", "pnpm"];
  if (options.template && !templateChoices.includes(options.template)) {
    throw new Error("Invalid template choice");
  }
  if (
    options.packageManager &&
    !packageManagerChoices.includes(options.packageManager)
  ) {
    throw new Error("Invalid package manager choice");
  }

  if (options.help) {
    console.log(usage);
    process.exit(0);
  }
  questions.push({
    type: "text",
    name: "projectName",
    message: "Please enter a name for the project:",
    validate: function (value) {
      if (value.length) {
        return true;
      } else {
        return "Please enter a name for the project.";
      }
    },
    default: "my-project",
  });
  questions.push({
    type: "text",
    name: "projectDescription",
    message: "Please enter a description for the project:",
    default: "GraphQL API",
  });

  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please enter a template for the project:",
      choices: templateChoices,
      transformer: function (value) {
        return value.toLowerCase();
      },
      validate: function (value) {
        const valid = templateChoices.includes(value);
        if (valid) {
          return true;
        }
        return "Please enter a template for the project.";
      },
    });
  }

  if (!options.packageManager) {
    questions.push({
      type: "list",
      name: "packageManager",
      message: "Please select a package manager:",
      choices: packageManagerChoices,
      default: "pnpm",
      transformer: function (value) {
        return value.toLowerCase();
      },
      validate: function (value) {
        const valid = packageManagerChoices.includes(value);
        if (valid) {
          return true;
        }
        return "Please select a package manager.";
      },
    });
  }

  questions.push({
    type: "text",
    name: "installDependencies",
    message: "Install dependencies?",
    choice: ["y", "n"],
    default: "y",
  });

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    packageManager: options.packageManager || answers.packageManager,
    projectName: options.projectName || answers.projectName,
    runInstall:
      options.runInstall || answers.installDependencies === "y" ? true : false,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}
