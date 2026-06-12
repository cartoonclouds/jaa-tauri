<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type { Event } from "@modules/events/domain/entities/Event";

  import { useEvent } from "@modules/events/composables/useEvent";
  import { EVENT_COPY_BY_STAGE } from "@modules/events/constants";
  import { selectInteractionStageEvents } from "@modules/events/utils/selectInteractionStageEvents";
  import { formatDisplayDateTime } from "@shared/utils/toDate";
  import { computed } from "vue";

  import NotesMarkdownViewerClient from "@/components/ui/NotesMarkdownViewer.client.vue";

  interface Props {
    application: Application | null;
  }

  const props = defineProps<Props>();
  const { items: eventItems } = useEvent();

  function compareBySortOrderAsc(left: Event, right: Event): number {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.id.localeCompare(right.id);
  }

  function compareBySortOrderDesc(left: Event, right: Event): number {
    return compareBySortOrderAsc(right, left);
  }

  const stageEvents = computed<Event[]>(() => {
    const allEvents = [
      ...selectInteractionStageEvents(eventItems.value, props.application?.id),
    ];

    const completedEventsAsc = allEvents
      .filter((event) => event.eventAt !== null)
      .sort(compareBySortOrderAsc);

    const uncompletedEventsAsc = allEvents
      .filter((event) => event.eventAt === null)
      .sort(compareBySortOrderAsc);

    const lastCompletedEvent =
      completedEventsAsc.length > 0
        ? completedEventsAsc[completedEventsAsc.length - 1]
        : undefined;

    const lastUncompletedEvent =
      uncompletedEventsAsc.length > 0
        ? uncompletedEventsAsc[uncompletedEventsAsc.length - 1]
        : undefined;

    return [
      ...(lastCompletedEvent ? [lastCompletedEvent] : []),
      ...(lastUncompletedEvent ? [lastUncompletedEvent] : []),
    ].sort(compareBySortOrderDesc);
  });
</script>

<template>
  <div v-if="application" class="space-y-4">
    <Message v-if="stageEvents.length === 0" severity="info">
      No stage events found for this application.
    </Message>

    <div v-else class="space-y-3">
      <article
        v-for="event in stageEvents"
        :key="event.id"
        class="rounded-xl border border-surface-200 bg-surface-0 p-4"
      >
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-surface-900">
              {{ EVENT_COPY_BY_STAGE[event.type]?.title ?? event.title }}
            </h3>
            <p class="mt-1 text-xs text-surface-500">{{ event.type }}</p>
          </div>

          <Tag
            :severity="event.eventAt ? 'success' : 'secondary'"
            :value="event.eventAt ? 'Completed' : 'Pending'"
          />
        </div>

        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt class="text-xs uppercase tracking-wide text-surface-500">
              Title
            </dt>
            <dd class="text-surface-900">{{ event.title || "-" }}</dd>
          </div>

          <div>
            <dt class="text-xs uppercase tracking-wide text-surface-500">
              Event At
            </dt>
            <dd class="text-surface-900">
              {{
                event.eventAt ? formatDisplayDateTime(event.eventAt) : "Pending"
              }}
            </dd>
          </div>

          <div>
            <dt class="text-xs uppercase tracking-wide text-surface-500">
              Created At
            </dt>
            <dd class="text-surface-900">
              {{ formatDisplayDateTime(event.createdAt) }}
            </dd>
          </div>

          <div>
            <dt class="text-xs uppercase tracking-wide text-surface-500">
              Updated At
            </dt>
            <dd class="text-surface-900">
              {{ formatDisplayDateTime(event.updatedAt) }}
            </dd>
          </div>
        </dl>

        <div class="mt-4 space-y-2">
          <h4 class="text-xs uppercase tracking-wide text-surface-500">
            Description
          </h4>
          <p class="text-sm text-surface-800">
            {{
              event.description ||
              EVENT_COPY_BY_STAGE[event.type]?.description ||
              "-"
            }}
          </p>
        </div>

        <div class="mt-4 space-y-2">
          <h4 class="text-xs uppercase tracking-wide text-surface-500">
            Notes
          </h4>
          <p v-if="!event.notes" class="text-sm text-surface-500">No notes.</p>
          <NotesMarkdownViewerClient
            v-else
            :markdown="event.notes"
            editor-style="height: auto; max-height: 16rem;"
          />
        </div>
      </article>
    </div>
  </div>

  <Message v-else severity="info">
    Event stages are available after selecting or saving an application.
  </Message>
</template>
