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

uniform Vec6 u_relativePosition;
uniform float u_zIndicatorSize;
uniform float u_eIndicatorSize;
uniform float u_bailoutRadiusSquared;
uniform int u_smoothingEnabled;
uniform float u_logSmoothingRadius;
uniform int u_maxIterations;

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

vec2 complexPow(vec2 num, vec2 exponent) {
	float r = length(num);

	if (r == 0.0) return vec2(0.0, 0.0);

	float theta = atan(num.y, num.x);
	float logR = log(r);

	float newR = pow(r, exponent.x) * exp(-exponent.y * theta);
	float newTheta = exponent.x * theta + exponent.y * logR;

	return vec2(newR * cos(newTheta), newR * sin(newTheta));
}

void main() {
	// Calculate pixel position
	float aspectRatio = u_screenSize.x / u_screenSize.y;
	vec2 pixelOffset = (v_texCoord - vec2(0.5)) / u_zoom;
	pixelOffset.y /= aspectRatio;

	Vec6 pixelPosition = add(u_position, add(multiply(u_rightVector, pixelOffset.x), multiply(u_upVector, pixelOffset.y)));

	// Extract z, c, and e
	vec2 z = vec2(pixelPosition.z, pixelPosition.w);
	vec2 c = vec2(pixelPosition.x, pixelPosition.y);
	vec2 e = vec2(pixelPosition.v, pixelPosition.u);

	vec2 cRelative = vec2(u_relativePosition.x, u_relativePosition.y) + pixelOffset;
	vec2 zRelative = vec2(u_relativePosition.z, u_relativePosition.w);
	vec2 eRelative = vec2(u_relativePosition.v, u_relativePosition.u);

	// Render indicators
	vec4 CYAN = vec4(0.0, .8, .8, 1.0);
	vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
	if (renderIndicator(cRelative, zRelative, u_zIndicatorSize, CYAN)) return;
	if (renderIndicator(cRelative, eRelative, u_eIndicatorSize, RED)) return;

	int maxIterations = u_maxIterations;

	// Mandelbrot iteration
	int iterations = 0;
	float zz = dot(z, z);

	float zzSafe = zz; // track last finite zz for smoothing
	int safeIterations = 0;
	
	for (; zz < u_bailoutRadiusSquared && iterations < maxIterations; iterations++) {
		z = complexPow(z, e) + c;
		zz = dot(z, z);
		if (!isinf(zz)) {
			zzSafe = zz;
			safeIterations = iterations + 1;
		}
	}

	// Smoothing
	float smoothedIterations = float(iterations);
	if (iterations < maxIterations && u_smoothingEnabled == 1) {
		float log_zn = log(zzSafe) / 2.0;
		float nu = log(log_zn / u_logSmoothingRadius) / log(2.0);
		smoothedIterations = float(safeIterations) + 1.0 - nu;
	}

	float colorValue = clamp(smoothedIterations / float(maxIterations), 0.0, 1.0);
	fragColor = sampleGradient(colorValue);
}
