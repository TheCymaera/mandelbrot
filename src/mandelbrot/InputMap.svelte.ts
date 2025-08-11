import { juliaWardInputScheme, regularInputScheme, xWardInputScheme, type InputScheme } from './inputSchemes';

export const inputMap = new class InputMap {
	scheme = $state({...regularInputScheme});


	get isMovingLeft(): boolean {
		return this.#keys.has('KeyA') || this.#keys.has('ArrowLeft');
	}
	
	get isMovingRight(): boolean {
		return this.#keys.has('KeyD') || this.#keys.has('ArrowRight');
	}
	
	get isMovingUp(): boolean {
		return this.#keys.has('KeyW') || this.#keys.has('ArrowUp');
	}
	
	get isMovingDown(): boolean {
		return this.#keys.has('KeyS') || this.#keys.has('ArrowDown');
	}
	
	get isSneaking(): boolean {
		return this.#keys.has('ShiftLeft') || this.#keys.has('ShiftRight');
	}
	
	get isJumping(): boolean {
		return this.#keys.has('Space');
	}

	#keys = new Set<string>();
	
	constructor() {
		window.addEventListener('keydown', (e) => {
			// ignore if input is focused
			if (document.activeElement instanceof HTMLInputElement ||
				document.activeElement instanceof HTMLTextAreaElement) {
				return;
			}

			this.#keys.add(e.code);

			const movementModes: Record<string, InputScheme> = {
				'Digit1': regularInputScheme,
				'Digit2': juliaWardInputScheme,
				'Digit3': xWardInputScheme,
			};

			const mode = movementModes[e.code];
			if (!mode) return;
			this.scheme = { ...mode };
		});
		
		window.addEventListener('keyup', (e) => {
			this.#keys.delete(e.code);
		});
	}
	
}
