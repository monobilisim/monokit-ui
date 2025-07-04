Every API that will connect to a monokit server must use +page.server.ts for it.
Monokit base URL is "import { MONOKIT_URL } from '$env/static/private'"
Always use templating for fetch urls like `${MONOKIT_URL}/api/v1/endpoint`
Authentication is done using the Authorization header with the token use it like
```typescript
export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');
  const res = await fetch(`${MONOKIT_URL}/api/v1/endpoint`, {
    headers: {
      Authorization: authToken,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data from Monokit');
  }

  const data = await res.json();
  return { data };
};
```
The project is based on SvelteKit 2 and Svelte 5, so you can use the latest features of these frameworks.
Always write types there is a file called $lib/types.ts where you can put your types.
Project uses SSR rendering technicue, so you can use `load` functions to fetch data on the server side.
Use root layout for global error handling.
Always use components from $lib/components/ui directory with imports like import * as Card from "$lib/components/ui/card/index".
Make sure to use the components from the ui directory for consistency and maintainability.
Always name actions in +page.server.ts files as `actionName` and use the `actions` export to define them don't ever use `default` action.
We're on SvelteKit 2, so actions don't actually use name="" to be called, they are called by <form action="?/actionName" method="POST" use:enhance>
