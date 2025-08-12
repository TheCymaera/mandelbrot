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

//if (renderIndicator(
//	cb, zb, u_zIndicatorRotation, 
//	u_zIndicatorSize, CYAN, 
//	u_interpolation.y, BLACK, WHITE, 
//	u_interpolation.x, RED, GREEN)) {
//	return;
//}


//if (renderIndicator(
//	cb, eb, u_eIndicatorRotation, 
//	u_eIndicatorSize, RED, 
//	.0, BLACK, WHITE, 
//	u_interpolation.z, RED, GREEN)) {
//	return;
//}
