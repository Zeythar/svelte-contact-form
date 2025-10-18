export type Consent = { functionality?: boolean };

export function getConsent(): Consent | null {
	try {
		const m = document.cookie.match('(^|;)\\s*COOKIE_CONSENT\\s*=\\s*([^;]+)');
		if (!m) return null;
		return JSON.parse(decodeURIComponent(m[2]));
	} catch (e) {
		return null;
	}
}

export function setConsent(consent: Consent) {
	const maxAge = 60 * 60 * 24 * 365; // 1 year
	const value = encodeURIComponent(JSON.stringify(consent));
	document.cookie = `COOKIE_CONSENT=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
