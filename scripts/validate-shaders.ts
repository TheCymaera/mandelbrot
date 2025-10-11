#!/usr/bin/env bun
import { readFileSync, writeFileSync, mkdirSync, rmdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { preprocessShaderFromPath } from '../src/utilities/shaderPreprocessor.js';
import { execSync } from 'node:child_process';

const root = resolve(process.cwd());
const shadersDir = resolve(root, 'src/shaders');
const outDir = resolve(root, 'temp-preprocessed-shaders');
mkdirSync(outDir, { recursive: true });

function fileLoader(path: string): string | undefined {
	const full = resolve(shadersDir, path);
	try {
		return readFileSync(full, 'utf8');
	} catch {
		return undefined;
	}
}

function run(cmd: string) {
	try {
		execSync(cmd, { stdio: 'inherit' });
	} catch (e) {
		// allow non-zero exit
	}
}

function validateShader(path: string, stage: 'vert' | 'frag') {
	console.log('=========================================');
	console.log(`Validating ${stage} shader:\n${path}`);
	console.log('----------------------------------------');

	const escapedPath = path.replace(/(["\s'$`\\])/g,'\\$1');
	run(`glslangValidator -S ${stage} ${escapedPath}`);

	console.log('=========================================\n');
}

// Fragment
const fragOut = resolve(outDir, 'mandelbrot.preprocessed.frag');
writeFileSync(fragOut, preprocessShaderFromPath('mandelbrot.frag', fileLoader), 'utf8');
validateShader(fragOut, 'frag');

// Vertex
const vertOut = resolve(outDir, 'screenQuad.preprocessed.vert');
writeFileSync(vertOut, preprocessShaderFromPath('screenQuad.vert', fileLoader), 'utf8');
validateShader(vertOut, 'vert');

console.log('Shader validation complete.');


console.log(`Removing temporary shader directory: ${outDir}`);
rmdirSync(outDir, { recursive: true });