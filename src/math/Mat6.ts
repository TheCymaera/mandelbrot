import { Vec6 } from './Vec6.js';

/**
 * 6x6 matrix for 6D transformations and rotations
 */
export class Mat6 {
	// Store as column-major order (like OpenGL)
	private m: Float64Array;

	constructor(values?: number[]) {
		this.m = new Float64Array(36);
		if (values) {
			if (values.length !== 36) {
				throw new Error('Mat6 constructor requires exactly 36 values');
			}
			this.m.set(values);
		} else {
			// Initialize as identity matrix
			this.identity();
		}
	}

	static fromMaybeArray(arr: unknown): Mat6 {
		if (!Array.isArray(arr) || arr.length !== 36 || !arr.every(Number.isFinite)) {
			throw new Error('Invalid Mat6 array');
		}
		return new Mat6(arr as number[]);
	}

	toArray(): number[] {
		return Array.from(this.m);
	}

	/**
	 * Set this matrix to the identity matrix
	 */
	identity(): Mat6 {
		this.m.fill(0);
		for (let i = 0; i < 6; i++) {
			this.m[i * 6 + i] = 1;
		}
		return this;
	}

	/**
	 * Get matrix element at row i, column j
	 */
	get(i: number, j: number): number | undefined {
		return this.m[j * 6 + i];
	}

	/**
	 * Set matrix element at row i, column j
	 */
	set(i: number, j: number, value: number): void {
		this.m[j * 6 + i] = value;
	}

	/**
	 * Multiply this matrix by a Vec6
	 */
	multiplyVec6(v: Vec6): Vec6 {
		const result = new Vec6(0, 0, 0, 0, 0, 0);
		const components = [v.x, v.y, v.z, v.w, v.v, v.u];
		const resultComponents = [0, 0, 0, 0, 0, 0];

		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 6; j++) {
				resultComponents[i]! += this.get(i, j)! * components[j]!;
			}
		}

		return new Vec6(
			resultComponents[0]!,
			resultComponents[1]!,
			resultComponents[2]!,
			resultComponents[3]!,
			resultComponents[4]!,
			resultComponents[5]!,
		);
	}

	/**
	 * Multiply this matrix by another matrix
	 */
	multiply(other: Mat6): Mat6 {
		const result = new Mat6();
		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 6; j++) {
				let sum = 0;
				for (let k = 0; k < 6; k++) {
					sum += this.get(i, k)! * other.get(k, j)!;
				}
				result.set(i, j, sum);
			}
		}
		return result;
	}

	/**
	 * Create a rotation matrix in a 2D plane
	 * @param axis1 First axis index (0-5)
	 * @param axis2 Second axis index (0-5)
	 * @param angle Rotation angle in radians
	 */
	static createPlaneRotation(axis1: number, axis2: number, angle: number): Mat6 {
		const matrix = new Mat6();
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		// Set rotation in the specified plane
		matrix.set(axis1, axis1, cos);
		matrix.set(axis1, axis2, -sin);
		matrix.set(axis2, axis1, sin);
		matrix.set(axis2, axis2, cos);

		return matrix;
	}

	/**
	 * Clone this matrix
	 */
	clone(): Mat6 {
		return new Mat6(Array.from(this.m));
	}
}
