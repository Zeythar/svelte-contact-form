<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref } from '$lib/paraglide/runtime';
	import LocaleLink from '$lib/components/LocaleLink.svelte';

	import { onMount } from 'svelte';
	// de-localize the current path for aria-current checks (handles /sv/about -> /about)
	$: basePath = deLocalizeHref(page.url.pathname);

	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
</script>

<header>
	<nav>
		<ul>
			<li aria-current={basePath === '/' ? 'page' : undefined}>
				<LocaleLink href="/">Home</LocaleLink>
			</li>
			<li aria-current={basePath === '/about' ? 'page' : undefined}>
				<LocaleLink href="/about">About</LocaleLink>
			</li>
			<li aria-current={basePath.startsWith('/sverdle') ? 'page' : undefined}>
				<LocaleLink href="/sverdle" exact={false}>Sverdle</LocaleLink>
			</li>
		</ul>
	</nav>

	<div class="corner">
		<ThemeToggle ariaLabel="Theme" />
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	/* target only LocaleLink anchors inside this header via data attribute */
	nav :global([data-locale-link]) {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2linear;
	}

	:global([data-locale-link]:hover) {
		color: var(--color-theme-1);
	}
</style>
