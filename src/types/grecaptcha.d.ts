declare global {
	interface Window {
		grecaptcha?: {
			// grecaptcha.ready accepts a callback
			ready: (cb: () => void) => void;
			// execute returns a Promise<string> according to the current API
			execute: (siteKey: string, opts?: { action?: string }) => Promise<string>;
		};
	}
}

export {};
