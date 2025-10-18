import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

function parseCookieConsentFromHeader(cookieHeader: string) {
	try {
		const m = cookieHeader.match(/(?:^|;\s*)COOKIE_CONSENT=([^;]+)/);
		if (!m) return null;
		return JSON.parse(decodeURIComponent(m[1]));
	} catch {
		return null;
	}
}

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		// determine theme from cookie header
		const cookieHeader = event.request.headers.get('cookie') ?? '';
		const match = cookieHeader.match(/(?:^|;\s*)PREFERRED_THEME=([^;]+)/);
		let themeClass = '';
		if (match) {
			const value = match[1];
			if (value === 'dark') {
				themeClass = 'dark';
			} else if (value === 'high-contrast') {
				themeClass = 'high-contrast';
			}
			// 'light' and 'system' in light mode result in no class (empty string)
		}

		// parse cookie consent and expose to server-side code via locals
		// cast to any to avoid differences in project's Locals typing
		(event.locals as any).cookie_consent = parseCookieConsentFromHeader(cookieHeader);

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%theme.class%', themeClass)
		});
	});

export const handle: Handle = handleParaglide;
