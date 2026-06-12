import { getCurrentScope, onScopeDispose } from "vue";

type PubSubHandler = (payload: unknown) => void;

const listenersByTopic = new Map<string, Set<PubSubHandler>>();

/**
 * Lightweight app-wide pub/sub bus for cross-component notifications.
 */
export function usePubSub() {
  function publish(topic: string, payload?: unknown): void {
    const listeners = listenersByTopic.get(topic);
    if (!listeners || listeners.size === 0) {
      return;
    }

    for (const listener of listeners) {
      listener(payload);
    }
  }

  function subscribe(
    topic: string,
    handler: PubSubHandler,
    options: { autoDispose?: boolean } = {},
  ): () => void {
    const listeners = listenersByTopic.get(topic) ?? new Set<PubSubHandler>();
    listeners.add(handler);
    listenersByTopic.set(topic, listeners);

    const unsubscribe = (): void => {
      const activeListeners = listenersByTopic.get(topic);
      if (!activeListeners) {
        return;
      }

      activeListeners.delete(handler);
      if (activeListeners.size === 0) {
        listenersByTopic.delete(topic);
      }
    };

    const shouldAutoDispose = options.autoDispose !== false;
    if (shouldAutoDispose && getCurrentScope()) {
      onScopeDispose(unsubscribe);
    }

    return unsubscribe;
  }

  return {
    publish,
    subscribe,
  };
}
