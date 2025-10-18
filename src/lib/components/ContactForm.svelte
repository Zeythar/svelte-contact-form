<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	let subject = 'subject1';
	let email = '';
	let message = '';
	let submitting = false;
	let success: string | null = null;
	let error: string | null = null;

	// client-side validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	$: emailValid = emailRegex.test(email);
	$: subjectValues = options.map((o) => o.value);
	$: subjectValid = subjectValues.includes(subject);
	$: messageValid = message.trim().length > 0;
	$: formValid = emailValid && subjectValid && messageValid;

	// custom listbox state (moved here to avoid nested <script> tags)
	let open = false;
	// provide label as a function so the localized string is resolved at render time
	const options = [
		{ value: 'subject1', label: () => m.site_subject1() },
		{ value: 'subject2', label: () => m.site_subject2() },
		{ value: 'subject3', label: () => m.site_subject3() },
		{ value: 'subject4', label: () => m.site_subject4() }
	];

	function labelFor(value: string) {
		const opt = options.find((o) => o.value === value);
		if (!opt) return value;
		return typeof opt.label === 'function' ? (opt.label as () => string)() : (opt.label as string);
	}

	function selectValue(v: string) {
		subject = v;
		open = false;
	}
	// load runtime config from Vite env with sensible defaults for local dev
	// Set VITE_API_BASE to your backend base URL (e.g. https://api.example.com)
	const API_BASE: string = (import.meta.env.VITE_API_BASE as string) ?? 'http://localhost:8080';
	// Set VITE_RECAPTCHA_SITE_KEY to your site key in production; fallback to empty to disable
	const RECAPTCHA_SITE_KEY: string = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) ?? '';

	// load grecaptcha script for v3 and attach submit listener programmatically
	let formEl: HTMLFormElement | null = null;
	onMount(() => {
		console.log('[ContactForm] onMount called, formEl:', formEl);

		// close custom listbox when clicking outside
		const onDocClick = (e: MouseEvent) => {
			const target = e.target as Node | null;
			if (!target) return;
			// if click is outside our custom select, close it
			if (open && !(target as HTMLElement).closest?.('[data-custom-select]')) {
				open = false;
			}
		};
		document.addEventListener('click', onDocClick);

		// Load reCAPTCHA script if not already loaded
		if (!document.querySelector(`#recaptcha-script`)) {
			const s = document.createElement('script');
			s.id = 'recaptcha-script';
			s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
			document.head.appendChild(s);
		} else {
			// Script already exists - clean up the grecaptcha object to force re-initialization
			// This helps with HMR in development
			const win: any = window;
			if (win.grecaptcha) {
				console.log('[ContactForm] Resetting grecaptcha for HMR');
				// Remove the grecaptcha object so it re-initializes cleanly
				delete win.grecaptcha;
				// Remove and re-add the script
				const oldScript = document.querySelector('#recaptcha-script');
				if (oldScript) {
					oldScript.remove();
				}
				const s = document.createElement('script');
				s.id = 'recaptcha-script';
				s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
				document.head.appendChild(s);
			}
		}

		// focus the email input
		emailInput?.focus();

		// attach listener programmatically to avoid template binding issues
		const wrapper = (evt: Event) => {
			console.log('[ContactForm] wrapper called, evt:', evt);
			// forward event to the typed handler
			onSubmit(evt as SubmitEvent).catch((err) => {
				// ensure unhandled rejections are surfaced
				console.error('onSubmit error', err);
				console.error('Stack trace:', err.stack);
			});
		};

		console.log('[ContactForm] wrapper function:', wrapper);
		console.log('[ContactForm] typeof wrapper:', typeof wrapper);

		if (formEl) {
			console.log('[ContactForm] Adding event listener to formEl');
			try {
				formEl.addEventListener('submit', wrapper);
				console.log('[ContactForm] Event listener added successfully');
			} catch (err) {
				console.error('[ContactForm] Error adding event listener:', err);
				console.error('Stack trace:', (err as Error).stack);
			}
		} else {
			console.warn('[ContactForm] formEl is null, cannot add event listener');
		}

		return () => {
			console.log('[ContactForm] Cleanup called, formEl:', formEl);
			console.log('[ContactForm] wrapper at cleanup:', wrapper);
			document.removeEventListener('click', onDocClick);
			if (formEl) {
				try {
					console.log('[ContactForm] Removing event listener');
					formEl.removeEventListener('submit', wrapper);
					console.log('[ContactForm] Event listener removed successfully');
				} catch (err) {
					console.error('[ContactForm] Error removing event listener:', err);
					console.error('Stack trace:', (err as Error).stack);
				}
			}
		};
	});

	async function onSubmit(e: SubmitEvent) {
		console.log('[onSubmit] Function called, event:', e);
		// call preventDefault here instead of using the modifier on the template
		try {
			console.log('[onSubmit] Calling preventDefault');
			e.preventDefault();
			console.log('[onSubmit] preventDefault called successfully');
		} catch (err) {
			console.error('[onSubmit] Error in preventDefault:', err);
			console.error('Stack trace:', (err as Error).stack);
			throw err;
		}

		submitting = true;
		success = null;
		error = null;

		// Re-check client-side validation to avoid tampered fields prior to sending
		if (!emailValid) {
			error = m.contact_invalid_email();
			submitting = false;
			return;
		}
		if (!subjectValid) {
			error = m.contact_invalid_subject();
			submitting = false;
			return;
		}
		if (!messageValid) {
			error = m.contact_empty_message();
			submitting = false;
			return;
		}
		try {
			let token = '';
			// wait for grecaptcha to be ready and get token (v3)
			const win: any = window;
			console.log('[onSubmit] Checking grecaptcha, RECAPTCHA_SITE_KEY:', RECAPTCHA_SITE_KEY);
			console.log('[onSubmit] win.grecaptcha:', win.grecaptcha);

			if (RECAPTCHA_SITE_KEY && win.grecaptcha) {
				// Try to get reCAPTCHA token, but don't fail the form if reCAPTCHA has issues
				// This is especially important during development with HMR
				try {
					console.log('[onSubmit] Calling grecaptcha.ready()');
					// Wait for grecaptcha to be ready with a longer timeout
					await new Promise<void>((resolve, reject) => {
						const timeout = setTimeout(() => reject(new Error('reCAPTCHA timeout')), 10000);
						win.grecaptcha.ready(() => {
							clearTimeout(timeout);
							resolve();
						});
					});
					console.log('[onSubmit] grecaptcha.ready() completed');

					console.log('[onSubmit] Calling grecaptcha.execute()');
					token = await win.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
					console.log(
						'[onSubmit] grecaptcha.execute() completed, token:',
						token?.substring(0, 20) + '...'
					);
				} catch (err) {
					// Log the error but continue - reCAPTCHA errors shouldn't block form submission
					console.warn('[onSubmit] reCAPTCHA error (continuing without token):', err);
					console.warn('Stack trace:', (err as Error).stack);
					// token remains empty string
				}
			} else if (RECAPTCHA_SITE_KEY && !win.grecaptcha) {
				console.warn('[onSubmit] grecaptcha not loaded yet - submitting without token');
			}

			console.log('[onSubmit] Calling fetch');
			// send the localized subject label so outgoing emails show human-friendly text
			const subjectLabel = labelFor(subject);
			// ensure we have a stable client id to reduce false positives behind shared IPs
			let clientId: string | null = null;
			try {
				clientId = localStorage.getItem('clientId');
				if (!clientId && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
					clientId = crypto.randomUUID();
					localStorage.setItem('clientId', clientId);
				}
			} catch (e) {
				// ignore localStorage errors
			}

			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (clientId) headers['X-Client-Id'] = clientId;

			const res = await fetch(`${API_BASE}/api/contact`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ subject: subjectLabel, email, message, recaptchaToken: token })
			});
			console.log('[onSubmit] Fetch completed, status:', res.status);

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || res.statusText);
			}
			success = m.contact_sent_thanks();
			email = '';
			message = '';
		} catch (err: any) {
			console.error('[onSubmit] Caught error:', err);
			console.error('[onSubmit] Error stack:', err?.stack);
			error = err?.message || String(err);
		} finally {
			submitting = false;
		}
	}
	// accessibility: focus first input when mounted
	let emailInput: HTMLInputElement | null = null;
</script>

<form
	bind:this={formEl}
	class="flex flex-col gap-4 w-full max-w-lg border-2 p-4 rounded drop-shadow-2xl
	border-neutral-200 text-black
	dark:border-neutral-700 dark:text-white
	hc:border-white hc:text-white"
>
	<label for="subject-select" class="font-semibold">{m.contact_label_subject()}</label>

	<!-- Replaced native <select> with accessible custom listbox so hover styles work -->

	<!-- custom listbox markup below; logic has been moved into the top-level <script> to avoid nested scripts -->

	<div data-custom-select class="relative inline-block w-full max-w-lg">
		<button
			type="button"
			aria-haspopup="listbox"
			aria-expanded={open}
			class="w-full text-left p-2 rounded border border-neutral-300 bg-white dark:bg-black dark:border-neutral-700 dark:text-white hc:bg-black hc:text-white hc:hover:text-yellow hc:hover:border-yellow"
			on:click={() => (open = !open)}
			on:keydown={(e) => {
				if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
					e.preventDefault();
					open = true;
				}
				if (e.key === 'Escape') open = false;
			}}
		>
			{labelFor(subject)}
		</button>

		{#if open}
			<ul
				role="listbox"
				tabindex="-1"
				class="absolute left-0 right-0 mt-1 max-h-60 overflow-auto z-20 border border-neutral-300 bg-white dark:bg-black dark:border-neutral-700 hc:bg-black hc:text-white hc:border-white hc:hover:border-yellow rounded"
			>
				{#each options as opt}
					<li
						role="option"
						aria-selected={subject === opt.value}
						class="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white hc:hover:text-yellow hc:focus-visible:border-yellow hc:bg-black"
						on:click={() => selectValue(opt.value)}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								selectValue(opt.value);
							}
						}}
						tabindex="0"
					>
						{typeof opt.label === 'function' ? opt.label() : opt.label}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<label for="email-input" class="font-semibold">{m.contact_label_email()}</label>
	<input
		bind:this={emailInput}
		bind:value={email}
		class="placeholder:text-neutral-500 hc:placeholder:text-white border-1 border-neutral-300 p-2 rounded dark:border-neutral-700 hc:focus-visible:border-yellow"
		type="email"
		id="email-input"
		placeholder={m.contact_placeholder_email()}
		aria-label={m.contact_placeholder_email()}
		required
	/>
	<label for="message-textarea" class="font-semibold">{m.contact_label_message()}</label>
	<textarea
		bind:value={message}
		class="resize-none h-64 placeholder:text-neutral-500 p-2 rounded border-1 border-neutral-300 dark:border-neutral-700 hc:placeholder:text-white hc:focus-visible:border-yellow"
		placeholder={m.contact_placeholder_message()}
		aria-label={m.contact_placeholder_message()}
		id="message-textarea"
		required
	></textarea>
	<button
		class="py-2 px-4 rounded text-white uppercase bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 hover:border-blue-600 transition-colors
		dark:text-black dark:bg-blue-400 dark:border-blue-400 dark:hover:bg-blue-500 dark:hover:border-blue-500
		hc:bg-black hc:border-yellow hc:text-yellow hc:hover:bg-yellow hc:hover:text-black hc:transition-none"
		disabled={submitting}
		type="submit"
		>{submitting ? m.contact_sending() : m.contact_submit()}
	</button>

	{#if success}
		<div role="status" class="text-green-600">{success}</div>
	{/if}
	{#if error}
		<div role="alert" class="text-red-600">{m.contact_error_prefix()} {error}</div>
	{/if}
</form>
