<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  lists: {
    type: Array,
    default: () => [],
  },
  count: {
    type: Number,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  editingTask: {
    type: Object,
    default: null,
  },
  selectedUnit: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'save',
  'cancel-edit',
  'update:unit',
]);

const name = ref('');
const selectedListId = ref('');
const validationMessage = ref('');

const isEditing = computed(() => props.editingTask !== null);

function ensureValidListSelection(lists) {
  if (!lists.length) {
    selectedListId.value = '';
    return;
  }

  const selectedListExists = lists.some(
    (list) => String(list.id) === selectedListId.value,
  );

  if (!selectedListExists) {
    selectedListId.value = String(lists[0].id);
  }
}

watch(
  () => props.editingTask,
  (task) => {
    if (task) {
      name.value = task.name ?? '';
      selectedListId.value = String(
        task.task_list ?? task.list ?? '',
      );

      emit('update:unit', task.unit ?? '');
    } else {
      name.value = '';
      // Keep the current list selected so consecutive saves go to the same list.
      ensureValidListSelection(props.lists);
      emit('update:unit', '');
    }

    validationMessage.value = '';
  },
  { immediate: true },
);

watch(() => props.lists, ensureValidListSelection, { immediate: true });

function submit() {
  validationMessage.value = '';

  const cleanName = name.value.trim();

  if (!cleanName) {
    validationMessage.value = 'Enter a task name first.';
    return;
  }

  if (!selectedListId.value) {
    validationMessage.value = 'Choose a list to save this task.';
    return;
  }

  emit('save', {
    name: cleanName,
    task_list: Number(selectedListId.value),
    count: props.count,
    unit: props.selectedUnit.trim(),
  });
}
</script>

<template>
  <form class="task-composer" @submit.prevent="submit">
    <div class="composer-title">
      <h2>
        {{ isEditing ? 'Update task' : 'Save a task' }}
      </h2>

      <span class="count-preview">
        {{ count }}
      </span>
    </div>

    <div class="composer-fields">
      <label class="field-group task-name-field">
        <span>Task name</span>

        <input
          v-model="name"
          maxlength="200"
          type="text"
          placeholder="e.g. Water the plants"
          autocomplete="off"
        />
      </label>

      <label class="field-group list-select-field">
        <span>Save to list</span>

        <select
          v-model="selectedListId"
          :disabled="!lists.length"
        >
          <option value="">
            {{
              lists.length
                ? 'Choose a list…'
                : 'Create a list first'
            }}
          </option>

          <option
            v-for="list in lists"
            :key="list.id"
            :value="String(list.id)"
          >
            {{ list.name }}
          </option>
        </select>
      </label>

      <div class="selected-unit-summary">
        <span class="field-hint">Unit</span>
        <strong>{{ selectedUnit || 'List default' }}</strong>
      </div>

      <button
        class="button button-primary save-button"
        :disabled="isSaving || !lists.length"
        type="submit"
      >
        <span>
          {{
            isSaving
              ? 'Saving…'
              : isEditing
                ? 'Update task'
                : 'Save task'
          }}
        </span>

        <span aria-hidden="true">↗</span>
      </button>
    </div>

    <p
      v-if="validationMessage"
      class="inline-error"
      role="alert"
    >
      {{ validationMessage }}
    </p>

    <button
      v-if="isEditing"
      class="cancel-edit"
      type="button"
      @click="emit('cancel-edit')"
    >
      Cancel editing
    </button>
  </form>
</template>

<style scoped>
.selected-unit-summary {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
  padding: 0.75rem;
  border-radius: 0.65rem;
  background: var(--color-surface-subtle, #D0E7E6);
  color: var(--color-text-primary, #121A42);
}

.field-hint {
  color: var(--color-text-muted, #5C77A5);
  font-size: 0.8rem;
  line-height: 1.4;
}
</style>