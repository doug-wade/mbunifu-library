#! /usr/bin/env node

const path = require('path');
const argv = require('yargs').argv;
const inquirer = require('inquirer');

/*
 * Client generators have added a bin script that looks like this
 *     bin: "node_modules/@generator/library/bin/index.js"
 * We can then climb the file tree the corresponding amount to get to the location
 * of the package.json that has the bin script, which defines as a main script
 * the public programmatic api we generate in index.js.  This breaks our ability
 * to `npm link` the generator-library to develop locally, since it makes assumptions
 * about the shape of the node_modules directory that may not always be true.
 * We check an environment variable to allow us to work around this in dev. To test
 * the production path works as intended, copy the module into the node_modules
 * of a client generator, such as generator-generator.  I consider this a hack,
 * but can't think of a better way to do it.
 *
 * If we find a common use case that breaks because the node_modules directory
 * is shaped differently than we expect, we'll need to return to have a shim bin
 * script in each generator, something like
 *     #! /usr/bin/env node
 *     const api = require('.');
 *     api.run();
 * This allows us to exclusively use predictable `require` statements that don't
 * assume the file system structure of `node_modules`, and adds a new extension point
 * for client generators.
 */
let ClientGenerator;
let packageRoot;
if (process.env.NPM_LINKED) {
    packageRoot = path.join(__dirname, '..', '..', 'generator-generator');
    ClientGenerator = require(path.join(packageRoot, 'index.js'));
} else {
    packageRoot = path.resolve(path.join(__dirname, '..', '..', '..', '..'));
    ClientGenerator = require(packageRoot);
}

const clientGenerator = new ClientGenerator();

if (clientGenerator.debug) {
    console.log(`clientGenerator: ${JSON.stringify(clientGenerator)}`);
    console.log(`packageRoot: ${packageRoot}`);
}


/*
 * inquirer and yargs add custom objects to the argv and answers objects that we
 * don't want on the mustache context.
 */
const EXCLUDED_KEYS = new Set([ 'rl', '$0', '_', 'help', 'version', 'onForceClose', 'prompts' ]);

(async function runAsCli (context) {
    /*
     * The precedence order is
     * 1.) templatePath
     * 2.) templateDirectory + templateName
     * 3.) templateDirectory
     * templateDirectory is set on the library-provided generator, so we can trust
     * it to always be there.
     */
    if (!context.templatePath) {
        if (context.templateName) {
            context.templatePath = path.resolve(packageRoot, context.templateDirectory, context.templateName);
        } else {
            context.templatePath = path.resolve(packageRoot, context.templateDirectory);
        }
    }

    if (context.debug) {
        console.log(context.templatePath);
    }

    /*
     * Command-line arguments take precedence over values placed on the context
     * by the Generator class inheritance chain.
     */
    Object.keys(argv)
        .filter((elem) => !EXCLUDED_KEYS.has(elem))
        .forEach((elem) => {
            context[elem] = argv[elem];
        });

    /*
     * Don't prompt the user for an option if it has already been provided at
     * at command line.  This allows for the use of generators in shell scripts,
     * since you can bypass any interactive input by providing the appropriate
     * command line flags.
     */
    const prompts = context.prompts.filter((prompt) => !argv[prompt.name]);

    if (prompts.length) {
        const answers = await inquirer.prompt(prompts);

        /*
         * Answers give interactively take precendence overvalues placed on the context
         * by the Generator class inheritance chain as well.  They don't take precedence
         * over the command-line arguments, but those are never present on the answers
         * object, as they are filtered out of the prompts.
         */
        Object.entries(answers)
            .filter((elem) => !EXCLUDED_KEYS.has(elem))
            .forEach(([key, val]) => {
                context[key] = val || context[key];
            });
    }

    if (context.debug) {
        console.log(JSON.stringify(context));
    }

    context.run();
})(clientGenerator);
