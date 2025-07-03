<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<div
	class="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-black/80 to-gray-900/80"
>
	<div class="w-80 rounded-xs border border-white/20 bg-white/10 p-8 shadow-xs backdrop-blur">
		<h1 class="mb-8 text-center text-2xl text-white">Welcome to Monokit!</h1>
		<form method="POST" use:enhance>
			{#if form?.error}
				<div class="mb-4 text-center text-sm text-red-400">{form.error}</div>
			{/if}
			<div class="mb-4">
				<label for="username" class="mb-2 block font-medium text-white">
					Username <span class="text-red-500">*</span>
				</label>
				<input
					id="username"
					name="username"
					type="text"
					class="w-full rounded-full border border-white/30 bg-transparent px-4 py-3 text-base text-white outline-none"
					required
					autocomplete="username"
				/>
			</div>
			<div class="mb-6">
				<label for="password" class="mb-2 block font-medium text-white">
					Password <span class="text-red-500">*</span>
				</label>
				<input
					id="password"
					name="password"
					type="password"
					class="w-full rounded-full border border-white/30 bg-transparent px-4 py-3 text-base text-white outline-none"
					required
					autocomplete="current-password"
				/>
			</div>
			<Button type="submit" class="w-full rounded-full">Log in</Button>
		</form>
		<div class="mt-6 text-center">
			<Button
				type="button"
				class="w-full rounded-full"
				onclick={() =>
					(window.location.href =
						'/api/auth/sso/login?redirect_uri=' +
						encodeURIComponent(window.location.origin + '/api/v1/auth/sso/callback'))}
			>
				Login with Keycloak
			</Button>
		</div>
	</div>
	<div class="absolute right-4 bottom-4 text-xs text-white drop-shadow">
		<small> "Furggelen afterglow" by Lukas Schlagenhauf is licensed under CC BY-ND 2.0. </small>
	</div>
</div>
