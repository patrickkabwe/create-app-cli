module.exports = function (
  /** @type {import('plop').NodePlopAPI} */
  plop,
) {
  // controller generator
  plop.setGenerator('module', {
    description: 'application module',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: 'module name please',
        suffix: '(e.g. users or posts)',
      },
    ],
    actions: [
      {
        type: 'addMany',
        base: 'src/modules',
        templateFiles: 'plopfile-templates/{{moduleName}}*.hbs',
        destination: '/{{moduleName}}',
        force: true,
      },
      {
        type: 'add',
        path: 'src/modules/{{moduleName}}/{{moduleName}}.handlers.ts',
        templateFile: 'plopfile-templates/handler.hbs',
        force: true,
      },
      {
        type: 'add',
        path: 'src/modules/{{moduleName}}/{{moduleName}}.service.ts',
        templateFile: 'plopfile-templates/service.hbs',
        force: true,
      },
      {
        type: 'add',
        path: 'src/modules/{{moduleName}}/{{moduleName}}.schema.ts',
        templateFile: 'plopfile-templates/schema.hbs',
        force: true,
      },
      {
        type: 'add',
        path: 'src/modules/{{moduleName}}/{{moduleName}}.resolvers.ts',
        templateFile: 'plopfile-templates/resolver.hbs',
        force: true,
      },
      {
        type: 'add',
        path: 'src/modules/{{moduleName}}/{{moduleName}}.types.ts',
        templateFile: 'plopfile-templates/types.hbs',
        force: true,
      },
    ],
  });

  plop.setHelper('pluralize', function (text) {
    return text + 's';
  });
};
