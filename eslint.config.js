module.exports = [
    // Ignore files in the node_modules directory
    {
        ignores: ['node_modules/**'],
    },
    // Configuration for JavaScript, ECMAScript modules, and CommonJS modules
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            // Enforce consistent indentation (4 spaces)
            indent: ['error', 4],
            // Enforce the use of single quotes
            quotes: ['error', 'single'],
            // Require semicolons at the end of statements
            semi: ['error', 'always'],
        },
    },
];
