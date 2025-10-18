export type ThemePreference = 'dark' | 'light' | 'system' | 'high-contrast';

export function setPreferredTheme(value: ThemePreference) {
	const maxAge = 60 * 60 * 24 * 365; // 1 year
	// secure flag omitted for local dev, but consider adding Secure when using https in production
	// respect consent if present
	try {
		const m = document.cookie.match('(^|;)\\s*COOKIE_CONSENT\\s*=\\s*([^;]+)');
		const consent = m ? JSON.parse(decodeURIComponent(m[2])) : null;
		// If consent exists and functionality was explicitly denied, do not set theme.
		if (consent && consent.functionality === false) return;
		// If no consent exists yet, be conservative and do not set functionality cookies.
		if (!consent) return;
	} catch (e) {
		// ignore and proceed
	}
	document.cookie = `PREFERRED_THEME=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function getPreferredTheme(): ThemePreference | null {
	const m = document.cookie.match('(^|;)\\s*PREFERRED_THEME\\s*=\\s*([^;]+)');
	return m ? (m[2] as ThemePreference) : null;
}

// Apply the given theme preference to the document element by toggling classes.
export function applyThemeToDocument(value: ThemePreference) {
	// remove both classes first
	document.documentElement.classList.remove('dark');
	document.documentElement.classList.remove('high-contrast');

	if (value === 'dark') {
		document.documentElement.classList.add('dark');
	} else if (value === 'high-contrast') {
		document.documentElement.classList.add('high-contrast');
	} else if (value === 'system') {
		try {
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.add('dark');
			}
		} catch (e) {
			// ignore
		}
	}
}
