# winston-format-ec2

A [Winston](https://www.npmjs.com/package/winston) (>= 3.x) format for prepending the AWS EC2 instance ID (e.g. `i-abc123def456`) onto your log statements.

The instance ID is loaded dynamically via the [aws-sdk](https://www.npmjs.com/package/aws-sdk) utilizing the `MetadataService`. 

## Installation

### Installing

``` bash
  $ npm i winston-format-ec2
```

## Usage 

```typescript
import winston from "winston"
import { ec2WinstonFormat } from "winston-format-ec2"

const logger = winston.createLogger({
	format: ec2WinstonFormat(),
	level: "silly",
	transports: [
		new winston.transports.Console(),
	],
})

logger.silly("Silly log statement")
```

### Injecting MetadataService

You can also inject an instance of the AWS MetadataService:

```typescript
import AWS from "aws-sdk"
import { ec2WinstonFormat } from "winston-format-ec2"

const metadataService = new AWS.MetadataService()
const format = ec2WinstonFormat({
	awsMetadataService: metadataService,
})
```

#### Author: [Mike Richards](https://twitter.com/MMRichards)
