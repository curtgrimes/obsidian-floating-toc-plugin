import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import fs from 'fs';

const banner =
	`/*
	This is the Obsidian example vault is amazing, there are a lot of dazzling features and showcase, I believe you will wonder a bit, is this Obsidian?
	[Blue-topaz-examples](https://github.com/cumany/Blue-topaz-examples)
	*/
`;

const prod = (process.argv[2] === 'production');

// Obsidian requires that the style file is called styles.css
//const renameCSSFile = () => fs.rename('./build/main.css', './build/styles.css', () => { });
const copyjsonFile = () => fs.copyFile('./manifest.json', './build/manifest.json', () => { });
try {
	await esbuild.build({
		banner: {
			js: banner,
		},
		entryPoints: ['src/main.ts'],
		bundle: true,
		minify: true,
		external: [
			'obsidian',
			'electron',
			'@codemirror/autocomplete',
			'@codemirror/closebrackets',
			'@codemirror/collab',
			'@codemirror/commands',
			'@codemirror/comment',
			'@codemirror/fold',
			'@codemirror/gutter',
			'@codemirror/highlight',
			'@codemirror/history',
			'@codemirror/language',
			'@codemirror/lint',
			'@codemirror/matchbrackets',
			'@codemirror/panel',
			'@codemirror/rangeset',
			'@codemirror/rectangular-selection',
			'@codemirror/search',
			'@codemirror/state',
			'@codemirror/stream-parser',
			'@codemirror/text',
			'@codemirror/tooltip',
			'@codemirror/view',
			...builtins],
		format: 'cjs',
		watch: prod ? false : {
			onRebuild: copyjsonFile
		},
		target: 'es2016',
		logLevel: "info",
		sourcemap: prod ? false : 'inline',
		treeShaking: true,
		outfile: './build/main.js',

	});
	//renameCSSFile();
	copyjsonFile();
}
catch (e) {
	console.error(e);
	process.exit(1)
}
