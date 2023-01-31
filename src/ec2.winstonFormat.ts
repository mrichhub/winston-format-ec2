import AWS, { AWSError } from "aws-sdk"
import { Format, TransformableInfo } from "logform"
import { EventEmitter } from "stream"
import { MESSAGE } from "triple-beam"
import winston from "winston"
import { WinstonTransformableInfo } from "./types/winston.transformableInfo"

// The requests for the MetadataService were found on:
// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
// This class uses the IMDSv2 method.

export class EC2WinstonFormatter extends EventEmitter
{
	private readonly awsMetadataService: AWS.MetadataService
	private instanceId?: string
	
	constructor(
		awsMetadataService?: AWS.MetadataService,
	) {
		super()

		this.awsMetadataService = awsMetadataService || new AWS.MetadataService()
		void this.loadInstanceId()
	}

	format(info: WinstonTransformableInfo): TransformableInfo {
		const messagePrepend = this.instanceId ? `\u001b[36m${this.instanceId}\u001b[0m ` : ""

		return {
			...info,
			[MESSAGE]: `${messagePrepend}${info[MESSAGE]|| info.message}`,
			message: `${messagePrepend}${info.message}`,
		}
	}

	private async loadInstanceId(): Promise<void> {
		const metadataToken = await this.requestTokenFromMetadata()

		if (metadataToken) {
			this.instanceId = await this.requestInstanceIdFromMetadata(metadataToken)

			if (this.instanceId) {
				this.emit("loaded")
			}
		}
	}

	private async requestInstanceIdFromMetadata(token: string): Promise<string|undefined> {
		return await new Promise<string|undefined>(resolve => {
			this.awsMetadataService.request(
				"/latest/meta-data/instance-id",
				{
					headers: {
						"X-aws-ec2-metadata-token": token,
					},
					method: "GET",
				},
				(err: AWSError, instanceId: string) => {
					if (err) {
						this.emit("error", err)
						return resolve(undefined)
					}

					return resolve(instanceId)
				},
			)
		})
	}

	private async requestTokenFromMetadata(): Promise<string|undefined> {
		return await new Promise<string|undefined>(resolve => {
			this.awsMetadataService.request(
				"/latest/api/token",
				{
					headers: {
						"X-aws-ec2-metadata-token-ttl-seconds": "21600",
					},
					method: "PUT",
				},
				(err: AWSError, token: string) => {
					if (err) {
						this.emit("error", err)
						return resolve(undefined)
					}

					return resolve(token)
				},
			)
		})
	}
}

export const ec2WinstonFormat = (config?: EC2WinstonFormatterConfig): Format => {
	const formatter = config?.formatter || new EC2WinstonFormatter(config?.awsMetadataService)
	
	return winston.format((info: WinstonTransformableInfo): TransformableInfo => formatter.format(info))()
}

export type EC2WinstonFormatterConfig = {
	awsMetadataService?: AWS.MetadataService
	formatter?: EC2WinstonFormatter
}
