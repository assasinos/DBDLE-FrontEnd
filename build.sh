#!/bin/sh

printf 'Compiling TS...\n'

tsc

printf 'Bundling...\n'
npx webpack --config webpack.config.js


printf 'Done!\n'