declare module '@sveltejs/kit' {
	interface Locals {
		cookie_consent?: { functionality?: boolean } | null;
	}
}
