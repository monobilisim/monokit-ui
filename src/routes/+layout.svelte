<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import NavigationMenuLink from '$lib/components/ui/navigation-menu/navigation-menu-link.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let dark = $state(false);

	$effect(() => {
		const stored = localStorage.getItem('dark-mode');
		if (stored === 'true') {
			dark = true;
			document.documentElement.classList.add('dark');
		} else {
			dark = false;
			document.documentElement.classList.remove('dark');
		}
	});

	function toggleDark() {
		dark = !dark;
		localStorage.setItem('dark-mode', dark ? 'true' : 'false');
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	async function logout(): Promise<void> {
		await fetch(`/logout`, {
			credentials: 'include'
		});
	}

	let { children }: { children: Snippet<[]> } = $props();
</script>

<main class="flex">
	{#if page.url.pathname !== '/login'}
		<div class="sidebar h-screen border border-slate-50">
			<Button onclick={toggleDark} variant="secondary">Toggle Dark Mode</Button>

			<Button
				type="submit"
				variant="destructive"
				class="w-full cursor-pointer"
				onclick={async () => logout()}>Logout</Button
			>

			<NavigationMenu.Root>
				<NavigationMenu.List class="flex flex-col gap-1 *:*:w-48">
					<NavigationMenu.Item>
						<NavigationMenuLink href="/">Dashboard</NavigationMenuLink>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenuLink href="/hosts">Hosts</NavigationMenuLink>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenuLink href="/users">Users</NavigationMenuLink>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenuLink href="/inventories">Inventories</NavigationMenuLink>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenuLink href="/groups">Groups</NavigationMenuLink>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenuLink href="/logs">Logs</NavigationMenuLink>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>
	{/if}

	<QueryClientProvider client={queryClient}>
		{@render children()}
	</QueryClientProvider>
</main>
