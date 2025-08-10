import { Vec6 } from "../math/Vec6";

export class RotateAction {
	axis1: number;
	axis2: number;
	speed: number;

	constructor(axis1: number, axis2: number, rotationSpeed: number) {
		this.axis1 = axis1;
		this.axis2 = axis2;
		this.speed = rotationSpeed;
	}
}

export class MoveAction {
	axis: Vec6;
	//speed: number;

	constructor(axis: Vec6) {
		this.axis = axis;
	}
}

export class ZoomAction {
	speed: number;

	constructor(speed: number) {
		this.speed = speed;
	}
}

export type Action = RotateAction | MoveAction | ZoomAction;

//export class MovementMode {
//	readonly displayName: string;
//	readonly horizontal: Action[];
//	readonly vertical: Action[];
//	readonly forward: Action[];
//	readonly velocityLerp: number;

//	constructor(options: {
//		displayName: string,
//		horizontal: Action[],
//		vertical: Action[],
//		forward: Action[],
//		velocityLerp: number,
//	}) {
//		this.displayName = options.displayName;
//		this.horizontal = options.horizontal;
//		this.vertical = options.vertical;
//		this.forward = options.forward;
//		this.velocityLerp = options.velocityLerp;
//	}

//	static readonly REGULAR = new MovementMode({
//		displayName: 'Regular',
//		velocityLerp: 3.5,
//		horizontal: [
//			new MoveAction(new Vec6(1, 0, 0, 0, 0, 0).scale(.8)),
//		],
//		vertical: [
//			new MoveAction(new Vec6(0, 1, 0, 0, 0, 0).scale(.8)),
//		],
//		forward: [
//			new ZoomAction(2.0),
//		],
//	});

//	static readonly JULIA_WARD = new MovementMode({
//		displayName: 'Julia-ward',
//		velocityLerp: 5,
//		horizontal: [
//			new MoveAction(new Vec6(0, 0, 1, 0, 0, 0).scale(.8)),
//		],
//		vertical: [
//			new MoveAction(new Vec6(0, 0, 0, 1, 0, 0).scale(.8)),
//		],
//		forward: [
//			new RotateAction(0, 2, 0.2),
//			new RotateAction(1, 3, 0.2),
//		],
//	});

//	static readonly X_WARD = new MovementMode({
//		displayName: 'X-ward',
//		velocityLerp: 5,
//		horizontal: [
//			new MoveAction(new Vec6(0, 0, 0, 0, 1, 0).scale(.8)),
//		],
//		vertical: [
//			new MoveAction(new Vec6(0, 0, 0, 0, 0, 1).scale(.8)),
//		],
//		forward: [
//			new RotateAction(0, 4, 0.2),
//			new RotateAction(1, 5, 0.2),
//		],
//	});
//}