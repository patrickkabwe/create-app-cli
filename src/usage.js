const commandLineUsage = require("command-line-usage");

const sections = [
  {
    header: "Create App",
    content:
      "A nodejs cli tool that help generate Rest, Graphql, etc. backend application",
  },
  {
    header: "Synopsis",
    content: "$ npx @kazion/create-app <options>",
  },
  {
    header: "Options",
    optionList: [
      {
        name: "help",
        typeLabel: "{underline Boolean}",
        description: "Print this usage guide.",
        type: Boolean,
        alias: "h",
      },
      {
        name: "template",
        description: "Template for the project. i.e graphql, rest, etc.",
        type: String,
        alias: "t",
      },
      {
        name: "package-manager",
        description: "Package manager to use. i.e npm, yarn, pnpm, etc.",
        type: String,
        alias: "p",
      },
      {
        name: "install",
        description: "Install dependencies.",
        type: Boolean,
        alias: "i",
      },
    ],
  },
];
const usage = commandLineUsage(sections);

module.exports = {
  usage,
};
