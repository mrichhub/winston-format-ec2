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
	private instanceIdFormatted?: string
	
	constructor(
		private readonly config: EC2WinstonFormatConfig = {},
	) {
		super()

		this.awsMetadataService = config.awsMetadataService || new AWS.MetadataService()
		void this.loadInstanceId()
	}

	format(info: WinstonTransformableInfo): TransformableInfo {
		const messagePrepend = this.instanceIdFormatted ? `${this.instanceIdFormatted} ` : ""

		return {
			...info,
			[MESSAGE]: `${messagePrepend}${info[MESSAGE]|| info.message}`,
			message: `${messagePrepend}${info.message}`,
		}
	}

	private async loadInstanceId(): Promise<void> {
		const metadataToken = await this.requestTokenFromMetadata()

		if (metadataToken) {
			let instanceId = await this.requestInstanceIdFromMetadata(metadataToken)

			if (instanceId) {
				if (this.config.maxLength) {
					instanceId = instanceId.substring(0, this.config.maxLength)
				}

				this.instanceIdFormatted = instanceId

				if (this.config.color) {
					this.instanceIdFormatted = `${this.config.color}[36m${instanceId}${this.config.color}[0m`
				}
				
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

export const ec2WinstonFormat = (config?: EC2WinstonFormatConfig): Format => {
	const formatter = new EC2WinstonFormatter(config)
	
	return winston.format((info: WinstonTransformableInfo): TransformableInfo => formatter.format(info))()
}

export type EC2WinstonFormatConfig = {
	awsMetadataService?: AWS.MetadataService
	color?: string
	maxLength?: number
}
