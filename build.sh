#!/bin/sh

printf 'Compiling TS...\n'

npx tsc

printf 'Bundling...\n'
npx webpack --config webpack.config.js


printf 'Done!\n'