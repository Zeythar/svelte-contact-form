<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		localizeHref,
		deLocalizeHref,
		extractLocaleFromUrl,
		getLocale,
		setLocale
	} from '$lib/paraglide/runtime';

	export let href: string;
	export let exact: boolean = true;
	// optional target with explicit default so Svelte treats it as optional
	export let target: string | undefined = undefined;
	// other attrs pass through via $$restProps

	$: localized = localizeHref(href);
	$: basePath = deLocalizeHref($page.url.pathname);
	$: ariaCurrent = (exact ? basePath === href : basePath.startsWith(href))
		? 'page'
		: (undefined as 'page' | undefined);

	function handleClick(event: MouseEvent) {
		// allow modifier keys, middle-click, non-left button or target _blank to do native behavior
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			target === '_blank'
		) {
			return;
		}
		// same-origin client navigation
		event.preventDefault();
		try {
			// If the localized href contains a different locale, update the runtime (and cookie)
			const targetLocale = extractLocaleFromUrl(localized);
			if (targetLocale && typeof getLocale === 'function') {
				try {
					const current = getLocale();
					if (current !== targetLocale) {
						// update locale via runtime; do not reload because we're navigating client-side
						setLocale(targetLocale, { reload: false });
					}
				} catch (e) {
					// getLocale may throw in some edge cases; ignore and proceed
				}
			}
		} catch (e) {
			// ignore any extraction errors and continue navigation
		}
		goto(localized);
	}
</script>

<a
	data-locale-link
	href={localized}
	{target}
	aria-current={ariaCurrent}
	on:click={handleClick}
	{...$$restProps}
>
	<slot />
</a>
