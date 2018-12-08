const { pascalCase, camelCase } = require('change-case');
const writeFiles = require('./lib/writeFiles');

const privateName = Symbol('name');
module.exports.Generator = class Generator {
    constructor(options) {
        Object.assign(this, options || {});
        this.templateDirectory = 'templates';
    }

    get name() {
        return this[privateName];
    }

    set name(name) {
        this.pascalCaseName = pascalCase(name.replace('-', ' '));
        this.camelCaseName = camelCase(name.replace('-', ' '));
        this[privateName] = name;
    }

    run() {
        writeFiles(this);
    }
};
