<script setup lang="ts">
  import type { ContactAssociatedCompany } from "@modules/contacts/repositories/ContactRepository";

  /**
   * Defines associated companies section props.
   */
  interface ContactAssociatedCompaniesSectionProps {
    isEditMode: boolean;
    associatedCompanies: ContactAssociatedCompany[];
    associatedCompaniesError: string | null;
    isLoadingAssociatedCompanies: boolean;
  }

  defineProps<ContactAssociatedCompaniesSectionProps>();

  const emit = defineEmits<{
    "request-open-company": [companyId: string];
  }>();
</script>

<template>
  <div class="space-y-2 border-t border-surface-200 pt-4 md:col-span-2">
    <h4 class="text-sm font-semibold text-surface-900">Associated Companies</h4>

    <Message v-if="!isEditMode" severity="info" size="small">
      Associated companies are available after the contact is created.
    </Message>

    <Message v-else-if="associatedCompaniesError" severity="error" size="small">
      {{ associatedCompaniesError }}
    </Message>

    <Message
      v-else-if="isLoadingAssociatedCompanies"
      severity="info"
      size="small"
    >
      Loading associated companies...
    </Message>

    <Message
      v-else-if="associatedCompanies.length === 0"
      severity="info"
      size="small"
    >
      No companies are associated with this contact.
    </Message>

    <div v-else class="overflow-x-auto rounded-lg border border-surface-200">
      <table class="min-w-full divide-y divide-surface-200 text-sm">
        <thead class="bg-surface-50 text-left text-surface-600">
          <tr>
            <th class="px-3 py-2 font-medium">Name</th>
            <th class="px-3 py-2 font-medium">Industry</th>
            <th class="px-3 py-2 font-medium">Website</th>
            <th class="px-3 py-2 font-medium">Location</th>
            <th class="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody
          class="divide-y divide-surface-200 bg-surface-0 text-surface-700"
        >
          <tr v-for="company in associatedCompanies" :key="company.id">
            <td class="px-3 py-2">{{ company.name }}</td>
            <td class="px-3 py-2">{{ company.industry || "-" }}</td>
            <td class="px-3 py-2">
              <a
                v-if="company.websiteUrl"
                :href="company.websiteUrl"
                target="_blank"
                rel="noreferrer"
                class="text-primary-600 hover:underline"
              >
                {{ company.websiteUrl }}
              </a>
              <span v-else>-</span>
            </td>
            <td class="px-3 py-2">{{ company.locationText || "-" }}</td>
            <td class="px-3 py-2 text-right">
              <Button
                type="button"
                text
                size="small"
                aria-label="Open company"
                @click="emit('request-open-company', company.id)"
              >
                <Icon
                  name="heroicons:arrow-top-right-on-square"
                  class="h-4 w-4"
                />
                <span>Open</span>
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
