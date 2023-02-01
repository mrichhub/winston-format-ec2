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
  format: winston.format.combine(
    winston.format.simple(),
    ec2WinstonFormat({
      color: "\u001b", //2aa198
    }),
  ),
  level: "silly",
  transports: [
    new winston.transports.Console(),
  ],
})

logger.silly("You silly log statement")
```

This example would output: **<span style="color:#2aa198">i-abc123def456</span> silly: You silly log statement**

### Format Options

```typescript
ec2WinstonFormat({
  color: "\u001b", // If you want the instance ID to be colored
  maxLength: 7, // To take only the first few characters of the instance ID instead of the whole thing
})
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
