import "vite/client";
import "@total-typescript/ts-reset";
/// <reference types="svelte" />

declare global {
	interface ObjectConstructor {
		entries<T>(o: T): [keyof T, T[keyof T]][];
	}
}

