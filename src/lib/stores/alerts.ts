/**
 * Global Alert System
 *
 * Usage:
 *
 * 1. From any Svelte component:
 *    import { alerts } from '$lib/stores/alerts';
 *    alerts.add({ type: 'success', message: 'Operation completed!' });
 *
 * 2. From +page.server.ts actions:
 *    return { type: 'success', message: 'Data saved successfully' };
 *    return fail(400, { type: 'error', message: 'Validation failed' });
 *
 * 3. From +layout.server.ts:
 *    return { alerts: [{ type: 'warn', message: 'Session expiring soon' }] };
 *
 * 4. Handle form responses automatically:
 *    import { handleFormResponse } from '$lib/stores/alerts';
 *    handleFormResponse(form);
 *
 * 5. Or manually:
 *    $effect(() => {
 *      if (form?.message) {
 *        alerts.add({ type: form.type || 'error', message: form.message });
 *      }
 *    });
 *
 * Alert types: 'success' | 'error' | 'warn' | 'info'
 */

import { writable } from 'svelte/store';
import type { AlertMessage } from '$lib/types';

function createAlertsStore() {
  const { subscribe, set, update } = writable<AlertMessage[]>([]);

  return {
    subscribe,
    add: (alert: Omit<AlertMessage, 'id'>) => {
      const id = crypto.randomUUID();
      const alertWithId = { ...alert, id };
      update((alerts) => [...alerts, alertWithId]);
      return id;
    },
    remove: (id: string) => {
      update((alerts) => alerts.filter((alert) => alert.id !== id));
    },
    clear: () => {
      set([]);
    },
    addFromForm: (form: { type: AlertMessage['type']; message: string } | null) => {
      if (form?.message) {
        const alertsInstance = createAlertsStore();
        return alertsInstance.add({ type: form.type, message: form.message });
      }
      return null;
    },
    addMultiple: (alerts: Omit<AlertMessage, 'id'>[]) => {
      alerts.forEach((alert) => {
        const id = crypto.randomUUID();
        const alertWithId = { ...alert, id };
        update((alertsList) => [...alertsList, alertWithId]);
      });
    }
  };
}

export const alerts = createAlertsStore();

/**
 * Utility function to handle form responses automatically
 * Use this in your Svelte components to automatically display alerts from form actions
 *
 * @param form - The form object from SvelteKit (containing type, message, or error)
 */
export function handleFormResponse(form: any) {
  if (!form) return;

  // Handle standard format: { type, message }
  if (form.message && form.type) {
    alerts.add({ type: form.type, message: form.message });
    return;
  }

  // Handle legacy login format: { error }
  if (form.error) {
    alerts.add({ type: 'error', message: form.error });
    return;
  }

  // Handle fallback cases
  if (form.message) {
    alerts.add({ type: 'error', message: form.message });
  }
}
