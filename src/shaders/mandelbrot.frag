#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

#include_shader("vec6.glsl");
#include_shader("indicators.glsl");

uniform Vec6 u_position;
uniform Vec6 u_upVector;
uniform Vec6 u_rightVector;

uniform vec2 u_screenSize;
uniform float u_zoom;

uniform float u_zIndicatorSize;
uniform float u_eIndicatorSize;
uniform float u_escapeRadiusSquared;
uniform int u_maxIterations;

//uniform float u_zIndicatorRotation;
//uniform float u_eIndicatorRotation;
//uniform bool u_renderIndicatorRotation;

// ==================================

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

	if (r == 0.0) return vec2(0.0, 0.0);

	float theta = atan(num.y, num.x);
	float logR = log(r);

	float newR = pow(r, exponent.x) * exp(-exponent.y * theta);
	float newTheta = exponent.x * theta + exponent.y * logR;

	return vec2(newR * cos(newTheta), newR * sin(newTheta));
}

#define COMPLEX_POWER complexPow

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
	vec2 z = vec2(pixelPosition.z, pixelPosition.w);
	vec2 c = vec2(pixelPosition.x, pixelPosition.y);
	vec2 e = vec2(pixelPosition.v, pixelPosition.u);

	// Render indicators
	vec4 CYAN = vec4(0.0, .8, .8, 1.0);
	vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
	vec4 GREEN = vec4(0.0, 1.0, 0.0, 1.0);
	vec4 BLACK = vec4(0.0, 0.0, 0.0, 1.0);
	vec4 WHITE = vec4(1.0, 1.0, 1.0, 1.0);

	if (renderIndicator(c, z, u_zIndicatorSize, CYAN)) return;
	if (renderIndicator(c, e, u_eIndicatorSize, RED)) return;

	int maxIterations = u_maxIterations;

	// Mandelbrot iteration
	int iterations = 0;
	while (dot(z, z) < u_escapeRadiusSquared && iterations < maxIterations) {
		z = COMPLEX_POWER(z, e) + c;
		iterations++;
	}
	
	float colorValue = float(iterations) / float(maxIterations);
	fragColor = sampleGradient(colorValue);
}
