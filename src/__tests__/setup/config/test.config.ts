export abstract class TestConfig
{
	protected numberOrDefault(value: string|undefined, defaultValue: number): number {
		const numericValue = this.numberOrUndefined(value)
		return numericValue !== undefined ? numericValue : defaultValue
	}

	protected numberOrUndefined(value: string|undefined): number|undefined {
		const numericValue = value ? parseInt(value) : undefined
		return numericValue !== undefined && !isNaN(numericValue) ? numericValue : undefined
	}

	protected stringOrDefault(value: string|undefined, defaultValue: string): string {
		return value || defaultValue
	}
}
