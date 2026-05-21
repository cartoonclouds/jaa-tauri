<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";

  import { Icon } from "#components";
  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
    <div class="mx-auto max-w-3xl space-y-6">
      <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
        <Icon name="heroicons:briefcase" class="text-emerald-400" />
        Apply-Flow
      </h1>

      <p class="text-slate-300">
        Feature modules are wired with repository, service, query composable,
        and CRUD pages.
      </p>

      <nav class="grid gap-2 text-sm sm:grid-cols-2">
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/applications"
          >Applications</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/companies"
          >Companies</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/contacts"
          >Contacts</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/tags"
          >Tags</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/documents"
          >Documents</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/events"
          >Events</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/notifications"
          >Notifications</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/settings"
          >Settings</NuxtLink
        >
        <NuxtLink
          class="rounded border border-slate-700 px-3 py-2 hover:bg-slate-900"
          to="/profile"
          >Profile</NuxtLink
        >
      </nav>

      <p
        class="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
      >
        <Icon name="heroicons:computer-desktop" />

        Device detection {{ $device.isMobile ? "Mobile" : "Desktop" }}
      </p>
    </div>

    <ApplicationComponent />
  </main>
</template>
