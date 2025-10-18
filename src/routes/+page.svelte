<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.site_title()}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1 class="text-3xl font-semibold text-black dark:text-white hc:text-white">
		Contact form in SvelteKit!
	</h1>
	<p class="text-black dark:text-white hc:text-white">
		Here is a sample <a
			href="https://google.com"
			class="rounded text-blue-700 dark:text-blue-500 hc:text-cyan hover:underline">link</a
		>
	</p>

	<ContactForm />
</section>
