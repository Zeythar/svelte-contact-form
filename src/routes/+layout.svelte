<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';

	let { children } = $props();
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import Footer from './Footer.svelte';
</script>

<div class="app">
	<!-- <Header /> -->

	<main>
		{@render children()}
	</main>

	<Footer />
	<CookieConsent />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 100vh;
	}
</style>
