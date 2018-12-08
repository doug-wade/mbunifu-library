# @mbunifu/library

A set of tools for creating project generators in the `npx` age.  Scaffold new projects
easily

```sh
$ npx @mbunifu/generator
```

With no global installations or local installations to clean up later.


# Getting started

The easiest way to get started is using `@mbunifu/generator`

```sh
$ npx @mbunifu/generator
```

The interactive wizard will walk you through setting up a new generator. Once you have a
new generator, run `npm run generate` from its root to test generating a new project from
the generated template. To start making changes, edit the files in `/templates`.


# Usage

## programmatic api

This file is intended to be exposed in the [main](https://docs.npmjs.com/files/package.json#main)
field of your package.json

```js
const { Generator } = require('@mbunifu/library');

class MyGenerator extends Generator {
  static prompts = {
        type: 'input',
        name: 'name',
        message: 'Choose a name for your project'
    }
}

module.exports = new MyGenerator();
```

## bin script

Set the [bin](https://docs.npmjs.com/files/package.json#bin)
field of your package.json as follows

```json
{
  "bin": "node_modules/@mbunifu/library/bin/index.js"
}
```

This file with `require` your subclass of Generator, and execute it as part of a shell script.


# API

We've tried to keep the API as small as possible, but no smaller.

## Generator

The base class for generators.  To create a new generator, run makeApi with a class
that extends this Generator class as the generator argument.

```js
const { Generator } = require('@mbunifu/library');

class GeneratorGenerator extends Generator {
  static name = 'my-generator'
}
```


# Options

Options can be specified in a number of ways

You can provide a default by setting it in the constructor of your generator class

```js
class MyGenerator extends Generator {
    static name = 'my-generator';
}
```

You can also prompt the end-user to provide the option.  There are a number of ways
to prompt the end-user to provide options

## Via an inquirer prompt

See the [inquirer](https://www.npmjs.com/package/inquirer) docs for more information

```js
class MyGenerator extends Generator {
    static prompts = {
        type: 'input',
        name: 'name',
        message: 'Choose a name for your project'
    }
}
```

## Via a command line argument

```
$ npx my-generator --name="my-generated-project"
```

## As a programmatic api option

```js
const getName = require('./get-name');
const MyGenerator = require('@mbunifu/my-generator');

const myGenerator = new MyGenerator({ name: getName() });

myGenerator.run();
```

## Honored options

To make the internal functioning of the generator library tick, some options are honored, whether
or not they are provided officially as part of your api.  Where possible, we've tried to provide
reasonable defaults; where not, it is annotated in the list below as required. If you can't provide
a required option on your inheriting class, make sure to document it as required as cli arguments
and programmatic options in your documentation.  Note that for all honored options, the
end-user-provided value will override your default value, so, for instance, is the user provided
`--dryRun=true` or `dryRun: true`, the generator will do a dry run, regardless of whether its been
set on your inheriting class.  Its a good idea to reference these options in your documentation
so end-users are aware of them.

### name

The name of the generated project.  Used to determine the directory that the project is scaffolded into,
and what is put into the name field of package.json.

### dryRun

Determines whether or not files will actually be written, or if only the file names will be written
to the console.

### debug

When enabled, outputs debugging information during generation.

### clobber

Determines whether it is permitted to clobber files that are already on the file system.  When this is
false, attempting to create a file that already exists will cause the cli to exit the process with an
exit code.

### templateOpeningTag

The opening tag used by the templating engine, [Mustache](https://www.npmjs.com/package/mustache).
Use this with `templateClosingTag` to change the way your templates are written, for instance if `{{}}` is
reserved for some other library or framework in the generated project.

### templateClosingTag

The closing tag used by the templating engine, [Mustache](https://www.npmjs.com/package/mustache).
Use this with `templateOpeningTag` to change the way your templates are written, for instance if `{{}}` is
reserved for some other library or framework in the generated project.

### templatePath

The directory that contains the template from which to generate the application.  Takes precedence over
`templateDirectory` and `templateName` when deciding from where to read your template.

### templateDirectory

The directory that contains sub-directories that correspond to your template or templates. If used with
`templateName`, the template contained in `templateDirectory/templateName` is used (allowing you to store
multiple templates in a single generator).  If not, the `templateDirectory` itself is treated as a template.

### templateName

The directory that is a sub-directory of `templateDirectory` and  contains the template from which to
generate the application.

### prompts

A list of [inquirer](https://www.npmjs.com/package/inquirer) prompts, used by the generated cli to generate
options from interactive command line input.

# Why another generator framework?

With the release of `npx`, the way that bin scripts are distributed and executed has changed. Global linking,
crucial to developing with other frameworks, is no long possible. There is a new way to install and run
command-line tools more conducive to scaffolding projects, but it requires a single module that can be
downloading and executed by `npx`. `@mbunifu/library` seeks to address this.

## Why not yeoman?

Likely the most popular javascript scaffolding framework, [yeoman](https://www.npmjs.com/package/yo),
is a composable way to scaffold projects.  However, yo requires you install two packages
globally, the `yo` cli and the `generator-my-thing` package.  Generator-library is installed
locally, and automatically removes itself after use when used as a cli.  Generator-library
offers a programmatic api as an answer to Yeoman's composability, as it can be used for
scripting as well.

## Why not slush?

Slush requires knowledge of [gulp](https://gulpjs.com/) as well as [streams](https://nodejs.org/api/stream.html).
They are also installed globally.
