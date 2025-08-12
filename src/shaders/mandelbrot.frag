#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

#include_shader("vec6.frag");

uniform Vec6 u_position;
uniform Vec6 u_upVector;
uniform Vec6 u_rightVector;

uniform vec2 u_screenSize;
uniform float u_zoom;

uniform float u_zIndicatorSize;
uniform float u_eIndicatorSize;

uniform float u_zIndicatorRotation;
uniform float u_eIndicatorRotation;
uniform bool u_renderIndicatorRotation;

uniform vec3 u_interpolation;

// ==================================

const int ITERATIONS_BASE = 100;
const int ITERATIONS_PER_ZOOM = 50;
const int ITERATIONS_MIN = 50;
const int ITERATIONS_MAX = 10000;

struct ColorStop {
	float position;
	vec4 color;
};

ColorStop gradient[5] = ColorStop[5](
	ColorStop(0.0, vec4(0.0 / 255.0, 7.0 / 255.0, 100.0 / 255.0, 1.0)),
	ColorStop(0.16, vec4(32.0 / 255.0, 107.0 / 255.0, 203.0 / 255.0, 1.0)),
	ColorStop(0.42, vec4(237.0 / 255.0, 255.0 / 255.0, 255.0 / 255.0, 1.0)),
	ColorStop(0.6425, vec4(255.0 / 255.0, 170.0 / 255.0, 0.0 / 255.0, 1.0)),
	ColorStop(0.8575, vec4(0.0 / 255.0, 0.0 / 255.0, 0.0 / 255.0, 1.0))
);

vec4 sampleGradient(float position) {
	int maxIndex = gradient.length() - 1;
	for (int i = 0; i < maxIndex; i++) {
		if (position >= gradient[i].position && position <= gradient[i + 1].position) {
			float t = (position - gradient[i].position) / (gradient[i + 1].position - gradient[i].position);
			return mix(gradient[i].color, gradient[i + 1].color, t);
		}
	}
	return gradient[maxIndex].color;
}

bool renderIndicator(
	vec2 pixelPosition, vec2 point, float rotation,
	float ringSize, vec4 ringColor,
	float influence1, vec4 influence1NegColor, vec4 influence1PosColor,
	float influence2, vec4 influence2NegColor, vec4 influence2PosColor
) {
	float radius = ringSize;
	float innerRadius = ringSize * .7;

	float rotIndicatorSize = (radius - innerRadius) * 1.5;
	float rotIndicatorDistance = mix(innerRadius, radius, 0.5);

	vec2 direction = vec2(cos(rotation), sin(rotation));
	vec2 rotationIndicator = point + direction * rotIndicatorDistance;

	if (distance(rotationIndicator, pixelPosition) < rotIndicatorSize) {
		vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);
		vec4 negativeColor = vec4(1.0, 0.0, 0.0, 1.0);
		vec4 positiveColor = vec4(0.0, 1.0, 0.0, 1.0);

		vec4 outColor = baseColor;

		if (influence1 < 0.0) {
			outColor = mix(baseColor, influence1NegColor, -influence1);
		} else {
			outColor = mix(baseColor, influence1PosColor, influence1);
		}

		if (influence2 < 0.0) {
			outColor = mix(outColor, influence2NegColor, -influence2);
		} else {
			outColor = mix(outColor, influence2PosColor, influence2);
		}

		fragColor = outColor;

		return true;
	}

	float pointDistance = distance(point, pixelPosition);
	if (pointDistance < radius && pointDistance > innerRadius) {
		fragColor = ringColor;
		return true;
	}

	return false;
}

bool renderIndicator(vec2 z, vec2 c, float indicatorSize, vec4 color) {
	if (indicatorSize <= 0.0) return false;
	
	float distance = length(z - c);
	float threshold = indicatorSize;
	
	if (distance < threshold) {
		fragColor = color;
		return true;
	}
	
	return false;
}

vec2 complexPowOld(vec2 num, vec2 exponent) {
	float r = length(num);
	float theta = atan(num.y, num.x);
	vec2 result;

	if (r == 0.0) return vec2(0.0, 0.0);

	r = pow(r, exponent.x) * exp2(-theta * exponent.y);
	theta = theta * exponent.x + log2(r) * exponent.y;

	result.x = r * cos(theta);
	result.y = r * sin(theta);
	return result;
}

vec2 complexPow(vec2 num, vec2 exponent) {
	float r = length(num);
	float theta = atan(num.y, num.x);
	vec2 result;

	if (r == 0.0) return vec2(0.0, 0.0);

	float logR = log(r);
	float newR = pow(r, exponent.x) * exp(-theta * exponent.y);
	float newTheta = theta * exponent.x + logR * exponent.y;

	result.x = newR * cos(newTheta);
	result.y = newR * sin(newTheta);
	return result;
}

void main() {
	float aspectRatio = u_screenSize.x / u_screenSize.y;

	vec2 texCoord = v_texCoord - vec2(0.5);
	texCoord.y /= aspectRatio;

	Vec6 offset = add(
		scale(u_rightVector, texCoord.x),
		scale(u_upVector, texCoord.y)
	);
	Vec6 pixelPosition = add(u_position, scale(offset, 1.0 / u_zoom));
	
	// Extract z, c, and e
	vec2 zb = vec2(pixelPosition.z, pixelPosition.w);
	vec2 cb = vec2(pixelPosition.x, pixelPosition.y);
	vec2 eb = vec2(pixelPosition.v, pixelPosition.u);

	vec2 z = mix(zb, cb, u_interpolation.x);
	vec2 c = mix(zb, cb, u_interpolation.y);
	vec2 e = mix(eb, cb, u_interpolation.z);

	// Render indicators
	vec4 CYAN = vec4(0.0, .8, .8, 1.0);
	vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
	vec4 BLACK = vec4(0.0, 0.0, 0.0, 1.0);
	vec4 WHITE = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 GREEN = vec4(0.0, 1.0, 0.0, 1.0);

	if (u_renderIndicatorRotation) {
		if (renderIndicator(
			cb, zb, u_zIndicatorRotation, 
			u_zIndicatorSize, CYAN, 
			u_interpolation.y, BLACK, WHITE, 
			u_interpolation.x, RED, GREEN)) {
			return;
		}


		if (renderIndicator(
			cb, eb, u_eIndicatorRotation, 
			u_eIndicatorSize, RED, 
			.0, BLACK, WHITE, 
			u_interpolation.z, RED, GREEN)) {
			return;
		}
	} else {
		if (renderIndicator(c, z, u_zIndicatorSize, CYAN)) return;
		if (renderIndicator(c, e, u_eIndicatorSize, RED)) return;
	}

	// Calculate max iterations based on zoom
	int maxIterations = clamp(int(float(ITERATIONS_BASE) + 1.0 * float(ITERATIONS_PER_ZOOM)), ITERATIONS_MIN, ITERATIONS_MAX);
	
	// Mandelbrot iteration
	int iterations = 0;
	while (dot(z, z) < 4.0 && iterations < maxIterations) {
		z = complexPow(z, e) + c;
		iterations++;
	}
	
	float colorValue = float(iterations) / float(maxIterations);
	fragColor = sampleGradient(colorValue);
}
