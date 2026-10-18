<script setup>
defineProps({
  list: { type: Object, required: true },
  isSaving: { type: Boolean, default: false },
});
const emit = defineEmits(['edit-task', 'delete-task', 'delete-list', 'rename-list']);
</script>

<template>
  <article class="list-card">
    <header class="list-card-header">
      <div class="list-title-block">
        <h3>{{ list.name }}</h3>
      </div>
      <div class="list-actions">
        <button class="icon-button" type="button" :disabled="isSaving" :aria-label="`Rename ${list.name}`" title="Rename list" @click="emit('rename-list', list)">✎</button>
        <button class="icon-button icon-button-danger" type="button" :disabled="isSaving" :aria-label="`Delete ${list.name}`" title="Delete list" @click="emit('delete-list', list)">×</button>
      </div>
    </header>

    <div v-if="list.tasks?.length" class="task-rows">
      <div v-for="task in list.tasks" :key="task.id" class="task-row">
        <div class="task-copy">
          <div class="task-copy-details">
            <span class="task-name">{{ task.name }}</span>
            <span v-if="task.effective_unit || task.unit || list.unit" class="task-unit">
              {{ task.effective_unit || task.unit || list.unit }}
            </span>
          </div>
        </div>
        <div class="task-row-actions">
          <span class="task-count-badge">{{ task.count }}</span>
          <button class="task-action" type="button" :disabled="isSaving" :aria-label="`Edit ${task.name}`" @click="emit('edit-task', { ...task, list: list.id })">Edit</button>
          <button class="task-action task-action-danger" type="button" :disabled="isSaving" :aria-label="`Delete ${task.name}`" @click="emit('delete-task', task)">Delete</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-list-state">
      <span aria-hidden="true">↳</span>
      <p>No tasks here yet. Save your first count to this list.</p>
    </div>
  </article>
</template>
