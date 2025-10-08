import { Mat6 } from "../math/Mat6";
import { lerp } from "../math/numbers";
import { Vec6 } from "../math/Vec6";

export namespace SimplifiedRotation {
	export interface Params {
		juliaWise: number;
		exponentWise: number;
		juliaToExponentWise: number;
	}
}

export class SimplifiedRotation implements SimplifiedRotation.Params {
	juliaWise: number;
	exponentWise: number;
	juliaToExponentWise: number;

	constructor({ juliaWise, exponentWise, juliaToExponentWise }: SimplifiedRotation.Params) {
		this.juliaWise = juliaWise;
		this.exponentWise = exponentWise;
		this.juliaToExponentWise = juliaToExponentWise;
	}

	static fromMaybeObject(obj: unknown): SimplifiedRotation {
		if (!obj || typeof obj !== "object") throw new Error("Invalid SimplifiedRotation object");

		const o = obj as Partial<SimplifiedRotation.Params>;
		return new SimplifiedRotation({
			juliaWise: typeof o.juliaWise === "number" ? o.juliaWise : 0,
			exponentWise: typeof o.exponentWise === "number" ? o.exponentWise : 0,
			juliaToExponentWise: typeof o.juliaToExponentWise === "number" ? o.juliaToExponentWise : 0,
		});
	}


	#memoizedMatrix: { simplifiedRotation: SimplifiedRotation; matrix: Mat6 } | undefined = undefined;
	toMatrix(): Mat6 {
		if (this.#memoizedMatrix && this.equals(this.#memoizedMatrix.simplifiedRotation)) {
			return this.#memoizedMatrix.matrix;
		}

		const matrix = Mat6.createPlaneMapping(Vec6.Z_INDEX, Vec6.W_INDEX, Vec6.V_INDEX, Vec6.U_INDEX, this.juliaToExponentWise)
			.multiply(Mat6.createPlaneMapping(Vec6.X_INDEX, Vec6.Y_INDEX, Vec6.V_INDEX, Vec6.U_INDEX, this.exponentWise))
			.multiply(Mat6.createPlaneMapping(Vec6.X_INDEX, Vec6.Y_INDEX, Vec6.Z_INDEX, Vec6.W_INDEX, this.juliaWise))

		this.#memoizedMatrix = { simplifiedRotation: new SimplifiedRotation(this), matrix };
		return matrix;
	}

	equals(other: SimplifiedRotation): boolean {
		return this.juliaWise === other.juliaWise &&
			this.exponentWise === other.exponentWise &&
			this.juliaToExponentWise === other.juliaToExponentWise;
	}

	lerp(target: SimplifiedRotation, t: number): SimplifiedRotation {
		return new SimplifiedRotation({
			juliaWise: lerp(this.juliaWise, target.juliaWise, t),
			exponentWise: lerp(this.exponentWise, target.exponentWise, t),
			juliaToExponentWise: lerp(this.juliaToExponentWise, target.juliaToExponentWise, t),
		});
	}

	normalize() {
		this.juliaWise = wrapAngle(this.juliaWise);
		this.exponentWise = wrapAngle(this.exponentWise);
		this.juliaToExponentWise = wrapAngle(this.juliaToExponentWise);
	}
}

function wrapAngle(angle: number): number {
	return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
}