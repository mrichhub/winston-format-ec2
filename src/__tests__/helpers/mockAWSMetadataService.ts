import { AWSError, MetadataService } from "aws-sdk"

export class MockMetadataService
{
	httpOptions: {
		timeout: 0
	}

	constructor(
		private readonly mockRequests: Record<string, string> = {},
	) { }

	// eslint-disable-next-line @typescript-eslint/ban-types
	request(...args: [path: string, callback: MetadataRequestCallback] | [path: string, options: { method?: string | undefined; headers?: { [key: string]: String}  | undefined} , callback: MetadataRequestCallback]): void {
		const path = args[0]

		let cb: MetadataRequestCallback | undefined

		for (const arg of args) {
			if (typeof arg === "function") {
				cb = arg
			}
		}

		if (cb) {
			cb(undefined, this.mockRequests[path])
		}
	}
}

type MetadataRequestCallback = (err: AWSError|undefined, data: string) => void

export const mockAWSMetadataService = (): MetadataService => {
	return new MockMetadataService()
}

export const mockAWSMetadataInstanceId = (instanceId: string): MetadataService => {
	return new MockMetadataService({
		"/latest/api/token": "test-token",
		"/latest/meta-data/instance-id": instanceId,
	})
}
