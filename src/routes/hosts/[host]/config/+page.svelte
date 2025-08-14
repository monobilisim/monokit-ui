<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { EditorView, keymap, lineNumbers } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { defaultKeymap } from '@codemirror/commands';
  import { yaml } from '@codemirror/lang-yaml';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { linter, type Diagnostic } from '@codemirror/lint';
  import * as jsyaml from 'js-yaml';

  type ExtendedPageData = PageData & {
    hostConfig?: Record<string, string>;
  };

  let { data }: { data: ExtendedPageData } = $props();
  const hostConfig: Record<string, string> = data.hostConfig || {};

  let hostConfigButUseful: { name: string; content: string }[] = $state(
    Object.entries(hostConfig).map(([key, value]) => ({ name: key, content: value }))
  );

  const stringHostConfig: string = JSON.stringify(hostConfigButUseful);

  let indexes = $state(
    hostConfigButUseful.map(() => ({
      editEnabled: false,
      diagnostics: [] as Diagnostic[]
    }))
  );

  function yamlEditor(
    node: HTMLElement,
    params: {
      value: string;
      readonly: boolean;
      onUpdate: (value: string) => void;
      onLint: (diagnostics: Diagnostic[]) => void;
    }
  ) {
    let readonlyConf = new Compartment();
    let editableConf = new Compartment();

    const fontSizeTheme = EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: 'monospace'
      }
    });

    const state = EditorState.create({
      doc: params.value,
      extensions: [
        keymap.of([...defaultKeymap]),
        EditorView.lineWrapping,
        yaml(),
        oneDark,
        lineNumbers(),
        fontSizeTheme,
        readonlyConf.of(EditorState.readOnly.of(params.readonly)),
        editableConf.of(EditorView.editable.of(!params.readonly)),
        linter((view) => {
          const diagnostics: Diagnostic[] = [];
          if (view.state.doc.toString().slice(-1) !== '\n') {
            console.log(view.state.doc.toString().slice(-1));
            diagnostics.push({
              from: view.state.doc.length - 1,
              to: view.state.doc.length,
              severity: 'error',
              message: 'File must end with a newline'
            });
          }

          try {
            jsyaml.load(view.state.doc.toString());
          } catch (e: unknown) {
            const match = e.message.match(/at line (\d+)/);
            if (match) {
              const lineNumber = parseInt(match[1], 10);
              const line = view.state.doc.line(lineNumber);
              diagnostics.push({
                from: line.from,
                to: line.to,
                severity: 'error',
                message: e.message
              });
            } else {
              diagnostics.push({
                from: 0,
                to: view.state.doc.length,
                severity: 'error',
                message: e.message
              });
            }
          }
          params.onLint(diagnostics);
          return diagnostics;
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            params.onUpdate(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: node
    });

    return {
      update(newParams: {
        value: string;
        readonly: boolean;
        onUpdate: (value: string) => void;
        onLint: (diagnostics: Diagnostic[]) => void;
      }) {
        if (view.state.readOnly !== newParams.readonly) {
          view.dispatch({
            effects: [
              readonlyConf.reconfigure(EditorState.readOnly.of(newParams.readonly)),
              editableConf.reconfigure(EditorView.editable.of(!newParams.readonly))
            ]
          });
        }

        if (newParams.value !== view.state.doc.toString()) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: newParams.value }
          });
        }
      },
      destroy() {
        view.destroy();
      }
    };
  }
</script>

{#if hostConfig}
  <div class="m-4 mr-0 grid h-full w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each hostConfigButUseful as row, index (index)}
      <Card.Root class="flex h-[60vh] w-full flex-col overflow-hidden">
        <Card.Header class="flex flex-row items-center justify-between">
          <Card.Title>{row.name}</Card.Title>
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
                };
              }}
            >
              <input type="hidden" name="changedFileName" value={row.name} />
              <input type="hidden" name="changedFileContent" value={row.content} />
              <input type="hidden" name="hostConfig" value={stringHostConfig} />
              <Button type="submit" size="sm">Save</Button>
            </form>
          {:else}
            <Button onclick={() => (indexes[index].editEnabled = true)} size="sm" variant="outline">
              Edit
            </Button>
          {/if}
        </Card.Header>
        <Card.Content class="flex-grow overflow-auto">
          <div
            class="h-full w-full"
            use:yamlEditor={{
              value: row.content,
              readonly: !indexes[index].editEnabled,
              onUpdate: (newValue) => {
                row.content = newValue;
              },
              onLint: (diagnostics) => (indexes[index].diagnostics = diagnostics)
            }}
          ></div>
        </Card.Content>
        <Card.Footer>
          {#if indexes[index].diagnostics.length > 0}
            <div class="text-destructive p-2 text-sm">
              {indexes[index].diagnostics[0].message}
            </div>
          {/if}
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
{/if}
