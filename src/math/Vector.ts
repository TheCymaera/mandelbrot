/**
 * 2D Vector class for mathematical operations
 */
export class Vec2 {
	constructor(public x: number = 0, public y: number = 0) {}
	
	static from(x: number, y: number): Vec2 {
		return new Vec2(x, y);
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

/**
 * 3D Vector class for mathematical operations
 */
export class Vec3 {
	constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}
	
	static from(x: number, y: number, z: number): Vec3 {
		return new Vec3(x, y, z);
	}
	
	static zero(): Vec3 {
		return new Vec3(0, 0, 0);
	}
	
	clone(): Vec3 {
		return new Vec3(this.x, this.y, this.z);
	}
	
	add(other: Vec3): Vec3 {
		return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
	}
	
	subtract(other: Vec3): Vec3 {
		return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
	}
	
	multiply(scalar: number): Vec3 {
		return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
	}
	
	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	
	normalize(): Vec3 {
		const len = this.length();
		return len > 0 ? new Vec3(this.x / len, this.y / len, this.z / len) : new Vec3(0, 0, 0);
	}

	distanceTo(other: Vec3): number {
		return Math.sqrt(
			(this.x - other.x) ** 2 +
			(this.y - other.y) ** 2 +
			(this.z - other.z) ** 2
		);
	}

	mix(other: Vec3, t: number): Vec3 {
		return new Vec3(
			this.x + (other.x - this.x) * t,
			this.y + (other.y - this.y) * t,
			this.z + (other.z - this.z) * t
		);
	}

	moveTowards(target: Vec3, maxDistance: number): Vec3 {
		const diff = target.subtract(this);
		if (diff.length() === 0) return this;

		const distance = Math.min(maxDistance, this.distanceTo(target));
		return this.add(diff.normalize().multiply(distance));
	}

	get xy(): Vec2 {
		return new Vec2(this.x, this.y);
	}
	
	toArray(): [number, number, number] {
		return [this.x, this.y, this.z];
	}
}
