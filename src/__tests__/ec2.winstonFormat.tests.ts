import { TransformableInfo } from "logform"
import { v4 as uuidv4 } from "uuid"
import winston from "winston"
import { EC2WinstonFormatter } from "../ec2.winstonFormat"
import { WinstonTransformableInfo } from "../types/winston.transformableInfo"
import { LogEmitterTransport } from "./helpers/logEmitterTransport"
import { mockAWSMetadataInstanceId } from "./helpers/mockAWSMetadataService"

describe("ec2WinstonFormat", () => {
	it("should prepend the instance id once loaded from AWS", done => {
		const instanceId = uuidv4()
		const logMessage = uuidv4()
		const color = "\u001b"
		const ec2Formatter = new EC2WinstonFormatter({
			awsMetadataService: mockAWSMetadataInstanceId(instanceId),
			color,
		})
		const logEmitterTransport = new LogEmitterTransport()
		const logger = winston.createLogger({
			format:  winston.format((info: WinstonTransformableInfo): TransformableInfo => ec2Formatter.format(info))(),
			level: "debug",
			transports: [
				logEmitterTransport,
			],
		})

		const timeout = setTimeout(() => {
			done(new Error("EC2 Winston Formatter failed to log"))
		}, 50)

		logEmitterTransport.on("log", (log: WinstonTransformableInfo) => {
			clearTimeout(timeout)

			try {
				expect(log.message).toEqual(`${color}[36m${instanceId}${color}[0m ${logMessage}`)
				done()
			}
			catch(err) {
				done(err)
			}
		})

		ec2Formatter.on("loaded", () => {
			try {
				logger.debug(logMessage)
			}
			catch(err) {
				clearTimeout(timeout)
				done(err)
			}
		})
	})
})
