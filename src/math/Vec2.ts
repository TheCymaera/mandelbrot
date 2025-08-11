/**
 * 2D Vector class for mathematical operations
 */
export class Vec2 {
	constructor(public x: number = 0, public y: number = 0) {}
	
	static from(x: number, y: number): Vec2 {
		return new Vec2(x, y);
	}

	static fromMaybeArray(array: unknown): Vec2 {
		if (!Array.isArray(array) || array.length !== 2 || !array.every(Number.isFinite)) {
			throw new Error('Invalid Vec2 array');
		}
		const a = array as number[];
		return new Vec2(a[0]!, a[1]!);
	}
	
	static zero(): Vec2 {
		return new Vec2(0, 0);
	}
	
	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}
	
	add(other: Vec2): Vec2 {
		return new Vec2(this.x + other.x, this.y + other.y);
	}
	
	subtract(other: Vec2): Vec2 {
		return new Vec2(this.x - other.x, this.y - other.y);
	}
	
	multiply(scalar: number): Vec2 {
		return new Vec2(this.x * scalar, this.y * scalar);
	}
	
	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	
	normalize(): Vec2 {
		const len = this.length();
		return len > 0 ? new Vec2(this.x / len, this.y / len) : new Vec2(0, 0);
	}
	
	mix(other: Vec2, t: number): Vec2 {
		return new Vec2(
			this.x + (other.x - this.x) * t,
			this.y + (other.y - this.y) * t
		);
	}
	
	toArray(): [number, number] {
		return [this.x, this.y];
	}
}
