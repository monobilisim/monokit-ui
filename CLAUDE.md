Every API that will connect to a monokit server must use +page.server.ts for it.
Config importer is located at $lib/config.ts, you can use it to get the configuration values.
Monokit base URL is "const MONOKIT_URL = Config.MONOKIT_URL"
Always use templating for fetch urls like `${MONOKIT_URL}/api/v1/endpoint`
Authentication is done using the Authorization header with the token use it like

```typescript
export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');
  const res = await fetch(`${MONOKIT_URL}/api/v1/endpoint`, {
    headers: {
      Authorization: authToken
    }
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return fail(res.status, {
      type: 'error',
      error: data.error || 'Login failed.'
    });
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
Don't use the type `any` in your code, always use specific types and if the type does not exists write in and import from `$lib/types`.
Use global alerts system to display notifications across the application.
Don't write unnecessary comments in your code, only write comments when it's really needed.
Project uses TypeScript don't ever write JsDoc comments, only use TypeScript types.
Don't change the structure of the project, always follow the existing structure.
Do not change how we authenticate users, always use the Authorization header with the token, don't use any wrapper or something make it less comprehensible.
Always care about code maintainability, readability and minimality. Performance is not a priority, but it should not be neglected.
Write your tests with vitest.
Always handle errors with alert manager from $lib/stores/alerts.
