declare module 'async_hooks' {
	// Minimal declaration for AsyncLocalStorage used by paraglide middleware
	export class AsyncLocalStorage<T = any> {
		constructor();
		getStore(): T | undefined;
		run<R = any>(store: T, callback: (...args: any[]) => R): R;
		enterWith(store: T): void;
	}
}
