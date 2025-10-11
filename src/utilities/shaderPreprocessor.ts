export type ShaderLoader = (path: string) => string | undefined;

const INCLUDE_REGEX = /#include_shader\(("[^"]+"|'[^']+')\);?/g;

export function preprocessShader(entrySource: string, loader: ShaderLoader): string {
	// Replace includes with loaded content; does not handle nested dependency graphs beyond one level
	return entrySource.replace(INCLUDE_REGEX, (match, quotedPath) => {
		const path = (quotedPath as string).slice(1, -1);
		const content = loader(path);
		if (typeof content !== 'string') {
			throw new Error(`Shader include not found: ${path}`);
		}
		return `\n// ---- begin include ${path} ----\n${content}\n// ---- end include ${path} ----\n`;
	});
}

/**
 * Preprocess by path using a loader that can fetch both the entry and its includes.
 */
export function preprocessShaderFromPath(entryPath: string, loader: ShaderLoader): string {
	const entry = loader(entryPath);
	if (typeof entry !== 'string') {
		throw new Error(`Shader entry not found: ${entryPath}`);
	}
	return preprocessShader(entry, loader);
}