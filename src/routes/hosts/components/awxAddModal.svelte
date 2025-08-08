<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Switch } from '$lib/components/ui/switch';

  /* prettier-ignore-start */
  import { codeToHtml } from 'shiki';
  /* prettier-ignore-end */

  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
  } from '$lib/components/ui/dialog';
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
  } from '$lib/components/ui/accordion';
  import { alerts, handleFormResponse } from '$lib/stores/alerts';
  import PlusCircleIcon from '@lucide/svelte/icons/plus-circle';
  import HelpCircleIcon from '@lucide/svelte/icons/help-circle';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import type { FormResponse } from '$lib/types';

  let {
    open = $bindable(),
    form,
    awxFreshInstallId
  }: {
    open: boolean;
    form: FormResponse | null;
    awxFreshInstallId: number | null;
  } = $props();

  let hostName = $state('');
  let ipAddress = $state('');
  let extraVars = $state('');
  let runSetupAfterPing = $state(false);
  let isSubmitting = $state(false);
  let hostNameError = $state('');
  let ipAddressError = $state('');
  let extraVarsError = $state('');
  let processingStep = $state(''); // '', 'adding', 'validating', 'setup', 'success'
  let successMessage = $state('');
  let highlightedYaml = $state('');

  $effect(() => {
    if (open) {
      resetForm();
    }
  });

  $effect(() => {
    if (form) {
      isSubmitting = true;
      handleFormResponse(form);
      if (form.type === 'success') {
        successMessage = form.message || 'Host added successfully';
        processingStep = 'success';
        isSubmitting = false;
      } else if (form.type === 'error') {
        processingStep = '';
        isSubmitting = false;
      }
    }
  });

  // @ts-expect-error somehow it does ot accept the type
  $effect(async (): Promise<void> => {
    if (extraVars.trim()) {
      try {
        const html = await codeToHtml(extraVars, {
          lang: 'yaml',
          theme: 'github-dark'
        });
        highlightedYaml = html.replace(/<pre[^>]*><code[^>]*>/, '').replace(/<\/code><\/pre>/, '');
      } catch (error) {
        console.error('Error highlighting YAML:', error);
        highlightedYaml = '';
      }
    } else {
      highlightedYaml = '';
    }
  });

  function resetForm() {
    hostName = '';
    ipAddress = '';
    extraVars = '';

    runSetupAfterPing = false;
    hostNameError = '';
    ipAddressError = '';
    extraVarsError = '';
    processingStep = '';
    successMessage = '';
    isSubmitting = false;
  }

  function validateForm() {
    let isValid = true;

    if (!hostName.trim()) {
      hostNameError = 'Host name is required';
      isValid = false;
    } else {
      hostNameError = '';
    }

    if (!ipAddress.trim()) {
      ipAddressError = 'IP address is required';
      isValid = false;
    } else {
      ipAddressError = '';
    }

    if (extraVars.trim()) {
      try {
        const lines = extraVars.trim().split('\n');
        for (const line of lines) {
          if (line.trim() && !line.includes(':') && !line.startsWith('#')) {
            throw new Error('Invalid YAML format');
          }
        }
        extraVarsError = '';
      } catch {
        extraVarsError = 'Invalid YAML format';
        isValid = false;
      }
    } else {
      extraVarsError = '';
    }

    return isValid;
  }

  function handleSubmit() {
    return async ({ update }: { update: () => Promise<void> }) => {
      if (!validateForm()) {
        return;
      }

      isSubmitting = true;
      processingStep = 'adding';
      successMessage = '';

      alerts.add({
        type: 'info',
        message: `Adding host "${hostName}" to AWX. This may take a few moments...`
      });

      await update();
    };
  }

  function handleClose() {
    if (!isSubmitting || processingStep === 'success') {
      open = false;
      resetForm();
    }
  }

  $effect(() => {
    if (hostNameError && hostName.trim()) {
      hostNameError = '';
    }
  });

  $effect(() => {
    if (ipAddressError && ipAddress.trim()) {
      ipAddressError = '';
    }
  });

  $effect(() => {
    if (extraVarsError && extraVars.trim()) {
      extraVarsError = '';
    }
  });
</script>

<Dialog bind:open>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <PlusCircleIcon class="text-primary h-5 w-5" />
        Add Host to AWX
      </DialogTitle>
      <DialogDescription>
        Add a new host to AWX with automatic validation and optional setup.
      </DialogDescription>
    </DialogHeader>

    <form action="?/addAwxHost" method="POST" use:enhance={handleSubmit} class="space-y-4">
      {#if successMessage}
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="text-sm text-green-800">
              {successMessage}
            </div>
          </div>
        </div>
      {/if}

      {#if isSubmitting}
        <div class="rounded-md bg-blue-50 p-4">
          <div class="flex items-center">
            <Loader2 class="mr-2 h-4 w-4 animate-spin text-blue-600" />
            <div class="text-sm text-blue-800">
              {#if processingStep === 'adding'}
                Creating host "{hostName}" in AWX...
              {:else}
                Processing host "{hostName}". This may take a few moments...
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <div class="space-y-2">
        <Label for="hostName">Host Name *</Label>
        <Input
          id="hostName"
          name="hostName"
          type="text"
          bind:value={hostName}
          placeholder="Enter host name"
          disabled={isSubmitting || processingStep === 'success'}
          required
        />
        {#if hostNameError}
          <p class="text-sm text-red-600">{hostNameError}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="ipAddress">IP Address *</Label>
        <Input
          id="ipAddress"
          name="ipAddress"
          type="text"
          bind:value={ipAddress}
          placeholder="Enter IP address"
          disabled={isSubmitting || processingStep === 'success'}
          required
        />
        {#if ipAddressError}
          <p class="text-sm text-red-600">{ipAddressError}</p>
        {/if}
      </div>

      <Accordion type="single">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Options</AccordionTrigger>
          <AccordionContent class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Label for="extraVars">Extra Variables (YAML format)</Label>
                <div class="group relative">
                  <HelpCircleIcon class="text-muted-foreground h-4 w-4 cursor-help" />
                  <div
                    class="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-md bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <div class="mb-1">Example:</div>
                    <div class="font-mono text-xs">
                      ansible_ssh_user: admin<br />
                      ansible_ssh_port: 22<br />
                      description: Production server
                    </div>
                  </div>
                </div>
              </div>

              <div class="relative">
                <Textarea
                  id="extraVars"
                  name="extraVars"
                  bind:value={extraVars}
                  class="sr-only"
                  disabled={isSubmitting}
                />

                <div class="relative overflow-hidden rounded-md border bg-gray-950">
                  {#if highlightedYaml}
                    <div class="pointer-events-none absolute inset-0 overflow-hidden p-3">
                      <div class="font-mono text-sm leading-5 break-words whitespace-pre-wrap">
                        <!-- eslint-disable-next-line -->
                        {@html highlightedYaml}
                      </div>
                    </div>
                  {/if}

                  <textarea
                    bind:value={extraVars}
                    placeholder="ansible_ssh_user: admin&#10;
ansible_ssh_port: 22&#10;
description: Production server"
                    rows={6}
                    disabled={isSubmitting}
                    class="relative z-10 w-full resize-none bg-transparent p-3 font-mono text-sm leading-5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 focus:outline-none"
                    style="color: transparent; caret-color: white;"
                  ></textarea>
                </div>
              </div>

              {#if extraVarsError}
                <p class="text-sm text-red-600">{extraVarsError}</p>
              {/if}
              <p class="text-muted-foreground text-xs">
                Optional. Specify additional variables for the host in YAML format.
              </p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Switch
                  id="runSetupAfterPing"
                  name="runSetupAfterPing"
                  bind:checked={runSetupAfterPing}
                  disabled={isSubmitting || processingStep === 'success'}
                />
                <Label for="runSetupAfterPing">Run Fresh Install Setup</Label>
              </div>
              <p class="text-muted-foreground text-xs">
                After ping test succeeds, run the job template with id {awxFreshInstallId !== null
                  ? awxFreshInstallId
                  : 'not available'} on this host.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <!-- Hidden inputs for form submission -->
      <input type="hidden" name="runSetupAfterPing" value={runSetupAfterPing} />

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onclick={handleClose}
          disabled={isSubmitting && processingStep !== 'success'}
        >
          {processingStep === 'success' ? 'Close' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isSubmitting || processingStep === 'success'}>
          {#if isSubmitting}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Processing...
          {:else}
            Add Host
          {/if}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
