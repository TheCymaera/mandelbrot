struct Vec6 {
	float x, y, z, w, v, u;
};

Vec6 add(Vec6 a, Vec6 b) {
	return Vec6(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w, a.v + b.v, a.u + b.u);
}

Vec6 scale(Vec6 v, float s) {
	return Vec6(v.x * s, v.y * s, v.z * s, v.w * s, v.v * s, v.u * s);
}