import { LocalTestConfig } from "./config/localTest.config"

const globalVar = global as Record<string, unknown>

export default () => {
	const config = new LocalTestConfig()
	globalVar["config"] = config
}
