import { Mandelbrot6DState } from './MandelbrotState.svelte.js';
import vertexShader from '../shaders/screenQuad.vert?raw';
import fragmentShader from '../shaders/mandelbrot.frag?raw';
import { preprocessShader } from '../utilities/shaderPreprocessor.js';
import type { Vec6 } from '../math/Vec6.js';

const glslModules = import.meta.glob('../shaders/**/*.glsl', { as: 'raw', eager: true });
const loader = (p: string) => {
	const key = Object.keys(glslModules).find(k => k.endsWith(p));
	if (!key) return undefined;
	return glslModules[key];
};


export class MandelbrotRenderer {
	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private resizeObserver: ResizeObserver;
	
	private uniforms: ReturnType<typeof this.getProgramUniforms>;
	
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl2')!;
		if (!this.gl) throw new Error('WebGL2 not supported');

		const vSource = preprocessShader(vertexShader, loader);
		const fSource = preprocessShader(fragmentShader, loader);
		this.program = createProgram(this.gl, vSource, fSource);
		this.uniforms = this.getProgramUniforms(this.gl, this.program);

		this.vao = setUpScreenQuadGeometry(this.gl, this.program);
		
		// Set up ResizeObserver to handle canvas resizing
		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				this.resize(width, height);
			}
		});
		
		this.resizeObserver.observe(canvas);
		
		// Bind program and VAO
		this.gl.useProgram(this.program);
		this.gl.bindVertexArray(this.vao);
	}
	
	resize(width: number, height: number): void {
		this.canvas.width = width;
		this.canvas.height = height;
		this.gl.viewport(0, 0, width, height);
	}
	
	render(state: Mandelbrot6DState): void {
		// Clear
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		const setVec6 = (uniforms: typeof this.uniforms.u_position, vec6: Vec6) => {
			this.gl.uniform1f(uniforms.x, vec6.x);
			this.gl.uniform1f(uniforms.y, vec6.y);
			this.gl.uniform1f(uniforms.z, vec6.z);
			this.gl.uniform1f(uniforms.w, vec6.w);
			this.gl.uniform1f(uniforms.v, vec6.v);
			this.gl.uniform1f(uniforms.u, vec6.u);
		};

		// Set uniforms
		setVec6(this.uniforms.u_position, state.position.add(state.animationOffset.scale(state.animationProgress)));
		setVec6(this.uniforms.u_upVector, state.upVector);
		setVec6(this.uniforms.u_rightVector, state.rightVector);

		setVec6(this.uniforms.u_relativePosition, state.relativePosition);
		this.gl.uniform1f(this.uniforms.u_zIndicatorSize, state.zIndicatorEffectiveSize);
		this.gl.uniform1f(this.uniforms.u_eIndicatorSize, state.eIndicatorEffectiveSize);
		this.gl.uniform1f(this.uniforms.u_zoom, state.zoomLevel);
		this.gl.uniform1f(this.uniforms.u_escapeRadiusSquared, state.escapeRadiusSquared);
		this.gl.uniform1i(this.uniforms.u_maxIterations, state.maxIterationsComputed);
		this.gl.uniform2f(this.uniforms.u_screenSize, this.canvas.width, this.canvas.height);

		// Draw
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
	}
	
	destroy(): void {
		this.resizeObserver.disconnect();
		
		if (this.program) {
			this.gl.deleteProgram(this.program);
		}
		if (this.vao) {
			this.gl.deleteVertexArray(this.vao);
		}
	}



	private getProgramUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
		const requireVec6 = (prefix: string) => ({
			x: requireUniform(gl, program, `${prefix}.x`),
			y: requireUniform(gl, program, `${prefix}.y`),
			z: requireUniform(gl, program, `${prefix}.z`),
			w: requireUniform(gl, program, `${prefix}.w`),
			v: requireUniform(gl, program, `${prefix}.v`),
			u: requireUniform(gl, program, `${prefix}.u`),
		});

		return {
			u_position: requireVec6('u_position'),
			u_upVector: requireVec6('u_upVector'),
			u_rightVector: requireVec6('u_rightVector'),

			u_relativePosition: requireVec6('u_relativePosition'),
			u_zIndicatorSize: requireUniform(gl, program, 'u_zIndicatorSize'),
			u_eIndicatorSize: requireUniform(gl, program, 'u_eIndicatorSize'),
			u_escapeRadiusSquared: requireUniform(gl, program, 'u_escapeRadiusSquared'),
			u_maxIterations: requireUniform(gl, program, 'u_maxIterations'),
			u_zoom: requireUniform(gl, program, 'u_zoom'),
			u_screenSize: requireUniform(gl, program, 'u_screenSize'),

			//u_zIndicatorRotation: requireUniform(gl, program, 'u_zIndicatorRotation'),
			//u_eIndicatorRotation: requireUniform(gl, program, 'u_eIndicatorRotation'),
			//u_renderIndicatorRotation: requireUniform(gl, program, 'u_renderIndicatorRotation'),
		} as const;
	}
}

// Preprocessing moved to utilities/shaderPreprocessor

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('Failed to create shader');

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		//gl.deleteShader(shader);
		throw new Error('Shader compilation error: ' + gl.getShaderInfoLog(shader));
	}
	
	return shader;
}

function createProgram(gl: WebGL2RenderingContext, vSource: string, fSource: string) {
	const vShader = createShader(gl, gl.VERTEX_SHADER, vSource);

	const fShader = createShader(gl, gl.FRAGMENT_SHADER, fSource);

	const program = gl.createProgram();
	if (!program) throw new Error("Failed to create WebGL program.");
	
	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error("WebGL program linking error: " + gl.getProgramInfoLog(program));
	}
	
	gl.deleteShader(vShader);
	gl.deleteShader(fShader);

	return program;
}

function requireUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string) {
	const location = gl.getUniformLocation(program, name);
	if (!location) {
		const reason = gl.getError();
		throw new Error(`Failed to get WebGL uniform location for "${name}": ${reason}`);
	}
	return location;
}

function setUpScreenQuadGeometry(gl: WebGL2RenderingContext, program: WebGLProgram) {
	const vertices = new Float32Array([
		-1, -1,  // bottom-left
		 1, -1,  // bottom-right
		-1,  1,  // top-left
		 1,  1,  // top-right
	]);
	
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	
	const positionLocation = gl.getAttribLocation(program, 'a_position');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
	gl.bindVertexArray(null);

	return vao;
}