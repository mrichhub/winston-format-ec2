import Transport from "winston-transport"
import { WinstonTransformableInfo } from "../../types/winston.transformableInfo"

export class LogEmitterTransport extends Transport
{
	constructor() {
		super()
	}

	log(info: WinstonTransformableInfo, next: () => void) {
		this.emit("log", info)
		next()
	}
}
