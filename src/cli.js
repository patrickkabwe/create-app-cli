const arg = require("arg");
const inquirer = require("inquirer");
const { createProject } = require("./main.js");

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--yes": Boolean,
      "--install": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    template: args._[0],
    runInstall: args["--install"] || false,
  };
}

async function promptForMissingOptions(options) {
  if (options.skipPrompts) {
    return {
      ...options,
    };
  }

  const questions = [];
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

  questions.push({
    type: "text",
    name: "template",
    message: "Please enter a template for the project:",
    choice: ["Graphql", "Rest"],
    default: "graphql",
  });

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
    template: "graphql",
    projectName: options.projectName || answers.projectName,
    runInstall:
      options.runInstall || answers.installDependencies === "y" ? true : false,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  console.log(options);
  await createProject(options);
}
