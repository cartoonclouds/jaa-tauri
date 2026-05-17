<script setup lang="ts">
const { data: projects, asyncStatus, error } = useProjectsQuery()

const createProject = useCreateProjectMutation()
const deleteProject = useDeleteProjectMutation()

const name = ref('')

async function submit() {
  if (!name.value.trim()) return

  await createProject.mutateAsync({
    name: name.value,
  })

  name.value = ''
}
</script>

<template>
  <main>
    <h1>Projects</h1>

    <form @submit.prevent="submit">
      <input
        v-model="name"
        type="text"
        placeholder="Project name"
      >

      <button :disabled="createProject.asyncStatus.value === 'loading'">
        Create project
      </button>
    </form>

    <p v-if="asyncStatus === 'loading'">
      Loading projects…
    </p>

    <p v-else-if="error">
      {{ error.message }}
    </p>

    <ul v-else>
      <li
        v-for="project in projects"
        :key="project.id"
      >
        <strong>{{ project.name }}</strong>

        <button
          type="button"
          @click="deleteProject.mutate(project.id)"
        >
          Delete
        </button>
      </li>
    </ul>
  </main>
</template>
