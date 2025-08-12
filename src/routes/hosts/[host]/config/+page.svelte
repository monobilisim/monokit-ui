<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  type ExtendedPageData = PageData & {
    hostConfig?: Record<string, string>;
  };

  let { data }: { data: ExtendedPageData } = $props();
  const hostConfig: Record<string, string> = data.hostConfig || {};

  let hostConfigButUseful: { name: string; content: string }[] = $state(
    Object.entries(hostConfig).map(([key, value]) => ({ name: key, content: value }))
  );

  let stringHostConfig: string = $derived(JSON.stringify(hostConfigButUseful));

  let indexes = $state(
    hostConfigButUseful.map(() => ({
      editEnabled: false
    }))
  );

  function leprint() {
    console.log(hostConfigButUseful);
  }
</script>

{#if hostConfig}
  <div class="m-4 mr-0 grid h-full w-full grid-cols-3 gap-4">
    {#each hostConfigButUseful as row, index (index)}
      <Card.Root class="h-[50vh] w-full overflow-hidden">
        <Card.Header class="flex items-center justify-between">
          <Card.Title>{row['name']}</Card.Title>
          {#if indexes[index].editEnabled}
            <form
              method="POST"
              action="?/putConfig"
              use:enhance={() => {
                return async ({ result, update }) => {
                  if (result.type === 'success') {
                    indexes[index].editEnabled = false;
                  }
                  update();
                  leprint();
                };
              }}
            >
              <input type="hidden" name="hostConfig" value={stringHostConfig} />
              <Button type="submit">Save</Button>
            </form>
          {:else}
            <Button onclick={() => (indexes[index].editEnabled = true)}>Edit</Button>
          {/if}
        </Card.Header>
        <Card.Content class="overflow-x-hidden overflow-y-auto">
          {#if indexes[index].editEnabled}
            <textarea
              class="boder-gray-200 h-full w-full border-1"
              bind:value={row.content}
              rows="15"
            ></textarea>
          {:else}
            {@html row['content'].replaceAll('\n', '<br/>').replaceAll(' ', '&nbsp;')}
          {/if}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
{/if}
