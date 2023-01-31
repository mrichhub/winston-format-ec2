import { LEVEL, MESSAGE, SPLAT } from "triple-beam"

export type WinstonTransformableInfo = {
	[LEVEL]?: string
	[MESSAGE]?: string
	[SPLAT]?: string
	level: string
	message: string
}
