<script lang="ts">
	import { onMount } from 'svelte';
	import {
		setPreferredTheme,
		getPreferredTheme,
		applyThemeToDocument,
		type ThemePreference
	} from '$lib/theme';

	export let ariaLabel = 'Theme';
	let theme: ThemePreference = 'system';

	onMount(() => {
		const cookie = getPreferredTheme();
		if (cookie) theme = cookie;
		else if (document.documentElement.classList.contains('high-contrast')) theme = 'high-contrast';
		else if (document.documentElement.classList.contains('dark')) theme = 'dark';
		else theme = 'system';
	});

	function handleThemeChange() {
		// apply immediately regardless of consent
		applyThemeToDocument(theme);
		// attempt to persist (may no-op if user hasn't consented)
		try {
			setPreferredTheme(theme);
		} catch (e) {
			// ignore
		}
	}
</script>

<label for="theme-select" class="visually-hidden">{ariaLabel}</label>
<select id="theme-select" bind:value={theme} on:change={handleThemeChange} aria-label={ariaLabel}>
	<option value="system">System</option>
	<option value="light">Light</option>
	<option value="dark">Dark</option>
	<option value="high-contrast">High contrast</option>
</select>
