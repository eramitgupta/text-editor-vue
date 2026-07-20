import eslint from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const eragRules = {
    rules: {
        'no-explicit-any': {
            meta: {
                type: 'problem',
                schema: [],
                messages: { forbidden: 'Unexpected any. Use a precise type.' },
            },
            create(context) {
                return {
                    TSAnyKeyword(node) {
                        context.report({ node, messageId: 'forbidden' });
                    },
                };
            },
        },
    },
};

export default [
    { ignores: ['dist/**', 'node_modules/**'] },
    eslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: [['@babel/preset-typescript', { allExtensions: true, isTSX: false }]],
                },
                sourceType: 'module',
            },
            globals: { ...globals.browser },
        },
        plugins: { erag: eragRules },
        rules: {
            'erag/no-explicit-any': 'error',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-duplicate-imports': 'error',
            complexity: ['warn', 24],
            'max-lines': ['warn', { max: 700, skipBlankLines: true, skipComments: true }],
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: { ts: babelParser },
                requireConfigFile: false,
                babelOptions: {
                    presets: [['@babel/preset-typescript', { allExtensions: true, isTSX: false }]],
                },
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
            },
            globals: { ...globals.browser },
        },
        rules: {
            'erag/no-explicit-any': 'error',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-duplicate-imports': 'error',
            complexity: ['warn', 24],
            'max-lines': ['warn', { max: 700, skipBlankLines: true, skipComments: true }],
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',
            'vue/attribute-hyphenation': ['error', 'always'],
            'vue/attributes-order': 'off',
            'vue/html-closing-bracket-spacing': 'off',
            'vue/html-indent': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
        },
        plugins: { erag: eragRules },
    },
    {
        files: ['vite.config.ts'],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: [['@babel/preset-typescript', { allExtensions: true, isTSX: false }]],
                },
            },
            globals: { ...globals.node },
        },
    },
    prettier,
];
