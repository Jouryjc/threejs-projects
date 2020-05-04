/**
 * @file 坐标向量类
 */

export default class Vector {
	constructor (x, y) {
		this.x = x;
		this.y = y;
	}

	getvec () {
		return this;
	}

	add (v2) {
		return new Vector(this.x + v2.x, this.y + v2.y);
	}

	subtract (v2) {
		return new Vector(this.x - v2.x, this.y - v2.y);
	}

	magnitude () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalise () {
		return this.divide(this.magnitude());
	}

	divide (n) {
		return new Vector((this.x / n) || 0, (this.y / n) || 0);
	}

	multiply (n) {
		return new Vector(this.x * n, this.y * n);
	}
};