export class Vec6 {
	x: number;
	y: number;
	z: number;
	w: number;
	v: number;
	u: number;

	constructor(x: number, y: number, z: number, w: number, v: number, u: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		this.v = v;
		this.u = u;
	}

	static fromMaybeArray(array: unknown): Vec6 {
		if (!Array.isArray(array) || array.length !== 6 || !array.every(Number.isFinite)) {
			throw new Error('Invalid Vec6 array');
		}
		const a = array as number[];
		return new Vec6(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!, a[5]!);
	}

	toArray(): number[] {
		return [this.x, this.y, this.z, this.w, this.v, this.u];
	}

	add(other: Vec6): Vec6 {
		return new Vec6(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z,
			this.w + other.w,
			this.v + other.v,
			this.u + other.u
		);
	}

	mix(other: Vec6, t: number): Vec6 {
		return new Vec6(
			this.x + (other.x - this.x) * t,
			this.y + (other.y - this.y) * t,
			this.z + (other.z - this.z) * t,
			this.w + (other.w - this.w) * t,
			this.v + (other.v - this.v) * t,
			this.u + (other.u - this.u) * t
		);
	}

	dot(other: Vec6): number {
		return this.x * other.x + this.y * other.y + this.z * other.z + 
				this.w * other.w + this.v * other.v + this.u * other.u;
	}

	length(): number {
		return Math.sqrt(this.dot(this));
	}

	normalize(): Vec6 {
		const mag = this.length();
		if (mag === 0) return new Vec6(0, 0, 0, 0, 0, 0);
		return this.scale(1 / mag);
	}

	scale(scalar: number): Vec6 {
		return new Vec6(
			this.x * scalar,
			this.y * scalar,
			this.z * scalar,
			this.w * scalar,
			this.v * scalar,
			this.u * scalar
		);
	}

	subtract(other: Vec6): Vec6 {
		return new Vec6(
			this.x - other.x,
			this.y - other.y,
			this.z - other.z,
			this.w - other.w,
			this.v - other.v,
			this.u - other.u
		);
	}

	static readonly X_INDEX = 0;
	static readonly Y_INDEX = 1;
	static readonly Z_INDEX = 2;
	static readonly W_INDEX = 3;
	static readonly V_INDEX = 4;
	static readonly U_INDEX = 5;

	static fromIndex(index: number): Vec6 {
		switch (index) {
			case Vec6.X_INDEX: return new Vec6(1, 0, 0, 0, 0, 0);
			case Vec6.Y_INDEX: return new Vec6(0, 1, 0, 0, 0, 0);
			case Vec6.Z_INDEX: return new Vec6(0, 0, 1, 0, 0, 0);
			case Vec6.W_INDEX: return new Vec6(0, 0, 0, 1, 0, 0);
			case Vec6.V_INDEX: return new Vec6(0, 0, 0, 0, 1, 0);
			case Vec6.U_INDEX: return new Vec6(0, 0, 0, 0, 0, 1);
			default: throw new Error('Invalid index');
		}
	}
}
