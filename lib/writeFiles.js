#! /usr/bin/env node
const walk = require('walk');
const fs = require('fs-extra');
const Mustache = require('mustache');
const path = require('path');

module.exports = (context) => {
    const templatePath = context.templatePath;
    const walkOptions = {
        listeners: {
            file: (root, fileStats, next) => {
                const fileName = path.resolve(root, fileStats.name);
                fs.readFile(fileName, 'utf8')
                    .catch((err) => {
                        throw err;
                    })
                    .then((data) => {
                        if (context.templateOpeningTag && context.templateClosingTag) {
                            Mustache.parse(data, [context.templateOpeningTag, context.templateClosingTag]);
                        } else {
                            Mustache.parse(data);
                        }
                        const componentData = Mustache.render(
                            data,
                            context
                        );

                        // write the file
                        const relativeDirectory = root.replace(templatePath, '');
                        const destinationPath = path.join(context.name, relativeDirectory, fileStats.name);

                        if (!context.clobber && fs.existsSync(destinationPath)) {
                            throw new Error(`Could not clobber file ${destinationPath}; exiting`);
                        }

                        if (!context.dryRun) {
                            fs.outputFile(destinationPath, componentData, 'utf8')
                                .catch((err) => {
                                    console.error(err); //eslint-disable-line no-console
                                });
                        }

                        console.log(`Wrote ${destinationPath}.`); //eslint-disable-line no-console

                        next();
                    });
            }
        }
    };

    walk.walk(templatePath, walkOptions);
};
