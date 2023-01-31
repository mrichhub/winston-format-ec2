import Transport from "winston-transport"

export class EmptyWinstonTransport extends Transport
{
	log?(info: unknown, next: () => void): void {
		next()
	}
}
