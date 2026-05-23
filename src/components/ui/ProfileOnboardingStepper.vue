<script setup lang="ts">
  import AppOnboardingWizard from "@modules/onboarding/presentation/components/AppOnboardingWizard.vue";

  const emit = defineEmits<{
    completed: [];
  }>();
</script>

<template>
  <AppOnboardingWizard @completed="emit('completed')" />
</template>



