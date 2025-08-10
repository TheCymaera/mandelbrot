function isRecord(obj: unknown): obj is Record<string, unknown> {
	return typeof obj === 'object' && obj !== null;
}

export function deepEquals(a: unknown, b: unknown): boolean {
	if (isRecord(a) && isRecord(b)) {
		const aKeys = Object.keys(a);
 
		if (aKeys.length !== Object.keys(b).length) return false;
 
		for(const key of aKeys) {
			if(!deepEquals(a[key], b[key])) return false;
		}
 
		return true;
	}

	return a === b;
}
