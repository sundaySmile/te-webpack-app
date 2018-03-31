const path = require('path');

module.exports = {
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },
    settings: {
        'html/indent': '+2',
        'import/resolver': {
            webpack: {
                config: path.join(__dirname, 'webpack.config.js')
            }
        }
    },
    env: {
        "browser": true,
        "node": true,
        "commonjs": true,
        "amd": true,
        "es6":true,
        "mocha":true
    },
    rules: {
        'linebreak-style': 'off',
        'consistent-return': 'off',
        'comma-dangle': ['error', 'never'],
        'import/prefer-default-export': 'off',
        'no-param-reassign': 'off',
        "no-dupe-args": 2,
        "no-dupe-keys": 2,
        "no-duplicate-case": 2,
        'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
        'no-alert': process.env.NODE_ENV === 'production' ? 2 : 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
    }
};