import unicorn from 'eslint-plugin-unicorn';
import {defineConfig} from 'eslint/config';

export default defineConfig([
	// …
	{
		files: ['**/*.js'],
		plugins: {
			unicorn,
		},
		extends: [
			'unicorn/recommended',
		],
		rules: {
			'unicorn/prefer-module': 'warn',
		},
	},
]);