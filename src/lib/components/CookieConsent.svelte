<script lang="ts">
	import { onMount } from 'svelte';
	import { getConsent, setConsent } from '$lib/consent';
	import { setPreferredTheme } from '$lib/theme';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';

	let show = false;

	onMount(() => {
		const c = getConsent();
		if (!c) show = true;
	});

	function accept() {
		setConsent({ functionality: true });
		// set preferred theme to whatever the user currently has active
		let current: import('$lib/theme').ThemePreference = 'system';
		try {
			// prefer any existing cookie
			const m = document.cookie.match('(^|;)\\s*PREFERRED_THEME\\s*=\\s*([^;]+)');
			if (m) {
				current = (m[2] as import('$lib/theme').ThemePreference) || 'system';
			} else {
				// fallback to the current document class (in case pref was set before consent)
				if (document.documentElement.classList.contains('high-contrast')) current = 'high-contrast';
				else if (document.documentElement.classList.contains('dark')) current = 'dark';
				else current = 'system';
			}
		} catch (e) {
			// ignore and default to light
		}
		// set default cookies that improve experience
		setPreferredTheme(current);
		// set the locale cookie if we can resolve the current locale
		try {
			const locale = getLocale();
			if (locale) setLocale(locale, { reload: false });
		} catch (e) {
			// ignore
		}
		show = false;
	}

	function decline() {
		setConsent({ functionality: false });
		show = false;
	}
</script>

{#if show}
	<div class="cookie-consent drop-shadow-2xl ">
		<p>We use cookies to improve your experience. Allow functionality cookies?</p>
		<div class="actions">
			<button
				on:click={accept}
				class="py-2 px-4 rounded text-white uppercase bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 hover:border-blue-600 transition-colors
		dark:text-black dark:bg-blue-400 dark:border-blue-400 dark:hover:bg-blue-500 dark:hover:border-blue-500
		hc:bg-black hc:border-yellow hc:text-yellow hc:hover:bg-yellow hc:hover:text-black hc:transition-none"
				>Yes</button
			>
			<button
				on:click={decline}
				class="py-2 px-4 rounded text-white uppercase bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 hover:border-blue-600 transition-colors
		dark:text-black dark:bg-blue-400 dark:border-blue-400 dark:hover:bg-blue-500 dark:hover:border-blue-500
		hc:bg-black hc:border-yellow hc:text-yellow hc:hover:bg-yellow hc:hover:text-black hc:transition-none"
				>No</button
			>
		</div>
	</div>
{/if}

<style>
	.cookie-consent {
		position: fixed;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		background: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 768px;
		width: calc(100% - 2rem); /* keeps small padding on narrow screens */
	}

	.actions button {
		margin-left: 0.5rem;
	}
</style>
