<script setup>
import { computed, onMounted, ref } from 'vue';

import AppHeader from './components/AppHeader.vue';
import CounterPanel from './components/CounterPanel.vue';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog.vue';
import ListDialog from './components/ListDialog.vue';
import TaskComposer from './components/TaskComposer.vue';
import TaskListCard from './components/TaskListCard.vue';
import UnitSelect from './components/UnitSelect.vue';

import { useTaskCounter } from './composables/useTaskCounter.js';

const {
  lists,
  isLoading,
  isSaving,
  errorMessage,
  statusMessage,
  hasLoadError,
  refreshLists,
  createList,
  renameList,
  deleteList,
  saveTask,
  deleteTask,
  clearMessages,
} = useTaskCounter();

const currentCount = ref(0);
const clearCanvasSignal = ref(0);

const isListDialogOpen = ref(false);
const listToRename = ref(null);
const editingTask = ref(null);
const deleteTarget = ref(null);

// Shared unit selection for the Units panel and TaskComposer.
const selectedUnit = ref('');

const totalLists = computed(() => lists.value.length);
const deleteConfirmation = computed(() => {
  if (!deleteTarget.value) return null;

  const { type, item } = deleteTarget.value;
  if (type === 'task') {
    return {
      title: 'Delete task?',
      description: `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      confirmLabel: 'Delete task',
    };
  }

  const taskCount = item.tasks?.length ?? 0;
  const taskLabel = taskCount === 1 ? 'task' : 'tasks';
  return {
    title: 'Delete list?',
    description: `Delete "${item.name}" and its ${taskCount} ${taskLabel}? This cannot be undone.`,
    confirmLabel: 'Delete list',
  };
});

onMounted(refreshLists);

function increment() {
  currentCount.value += 1;
  clearMessages();
}

function decrement() {
  currentCount.value = Math.max(0, currentCount.value - 1);
  clearMessages();
}

function resetCounter() {
  currentCount.value = 0;
  clearCanvasSignal.value += 1;
  clearMessages();
}

function openCreateList() {
  listToRename.value = null;
  isListDialogOpen.value = true;
  clearMessages();
}

function openRenameList(list) {
  listToRename.value = list;
  isListDialogOpen.value = true;
  clearMessages();
}

function closeListDialog() {
  if (isSaving.value) return;

  isListDialogOpen.value = false;
  listToRename.value = null;
}

async function submitList(name) {
  const wasRename = Boolean(listToRename.value);

  const success = wasRename
    ? await renameList(listToRename.value.id, name)
    : await createList(name);

  if (success) {
    isListDialogOpen.value = false;
    listToRename.value = null;
  }
}

function openDeleteListDialog(list) {
  deleteTarget.value = { type: 'list', item: list };
  clearMessages();
}

function handleEditTask(task) {
  editingTask.value = task;
  currentCount.value = task.count;
  selectedUnit.value = task.unit ?? '';

  clearCanvasSignal.value += 1;
  clearMessages();

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function cancelEditing() {
  editingTask.value = null;
  currentCount.value = 0;
  selectedUnit.value = '';

  clearCanvasSignal.value += 1;
  clearMessages();
}

async function handleSaveTask(payload) {
  const success = await saveTask(
    payload,
    editingTask.value?.id ?? null,
  );

  if (success) {
    editingTask.value = null;
    selectedUnit.value = '';
    resetCounter();
  }
}

function openDeleteTaskDialog(task) {
  deleteTarget.value = { type: 'task', item: task };
  clearMessages();
}

function closeDeleteDialog() {
  if (isSaving.value) return;
  deleteTarget.value = null;
}

async function confirmDelete() {
  const target = deleteTarget.value;
  if (!target) return;

  const success = target.type === 'task'
    ? await deleteTask(target.item.id)
    : await deleteList(target.item.id);

  if (!success) return;

  deleteTarget.value = null;

  if (target.type === 'task' && editingTask.value?.id === target.item.id) {
    cancelEditing();
  }

  if (
    target.type === 'list' &&
    editingTask.value &&
    Number(editingTask.value.task_list ?? editingTask.value.list) === Number(target.item.id)
  ) {
    cancelEditing();
  }
}
</script>

<template>
  <main class="page-shell">
    <AppHeader />

    <!-- Error and success messages -->
    <div
      v-if="errorMessage"
      class="notice notice-error"
      role="alert"
    >
      <span class="notice-icon" aria-hidden="true">!</span>

      <p>{{ errorMessage }}</p>

      <button
        type="button"
        aria-label="Dismiss error"
        @click="clearMessages"
      >
        ×
      </button>
    </div>

    <div
      v-else-if="statusMessage"
      class="notice notice-success"
      role="status"
    >
      <span class="notice-icon" aria-hidden="true">✓</span>

      <p>{{ statusMessage }}</p>

      <button
        type="button"
        aria-label="Dismiss message"
        @click="clearMessages"
      >
        ×
      </button>
    </div>

    <!-- Four-box dashboard -->
    <section class="dashboard-grid">
      <!-- BOX 1: Counter - top left -->
      <section class="dashboard-panel counter-panel">
        <CounterPanel
          :count="currentCount"
          :clear-signal="clearCanvasSignal"
          @increment="increment"
          @decrement="decrement"
          @reset="resetCounter"
        />
      </section>

      <!-- BOX 2: Task Composer - top right -->
      <section class="dashboard-panel composer-panel">
        <TaskComposer
          :lists="lists"
          :count="currentCount"
          :is-saving="isSaving"
          :editing-task="editingTask"
          :selected-unit="selectedUnit"
          @update:unit="selectedUnit = $event"
          @save="handleSaveTask"
          @cancel-edit="cancelEditing"
        />
      </section>

      <!-- BOX 3: Task Lists - bottom left -->
      <section
        class="dashboard-panel lists-section"
        aria-labelledby="lists-heading"
      >
        <header class="lists-section-header">
          <h2 id="lists-heading">
            Task lists
            <span class="heading-count">{{ totalLists }}</span>
          </h2>

          <button
            class="button button-secondary"
            type="button"
            @click="openCreateList"
          >
            <span aria-hidden="true">＋</span>
            New list
          </button>
        </header>

        <!-- Loading state -->
        <div
          v-if="isLoading"
          class="loading-state"
          role="status"
        >
          <span
            class="loading-spinner"
            aria-hidden="true"
          ></span>

          <p>Loading your lists…</p>
        </div>

        <!-- Load error -->
        <div
          v-else-if="hasLoadError && !lists.length"
          class="empty-state"
        >
          <h3>Lists could not be loaded</h3>

          <p>Check that the Django server is running, then try again.</p>

          <button
            class="button button-primary"
            type="button"
            @click="refreshLists()"
          >
            Try again
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!lists.length"
          class="empty-state"
        >
          <div
            class="empty-illustration"
            aria-hidden="true"
          >
            <span>☷</span>
            <span>＋</span>
          </div>

          <h3>Your first list starts here</h3>

          <p>
            Create a list for routines, projects, or anything
            you want to count.
          </p>

          <button
            class="button button-primary"
            type="button"
            @click="openCreateList"
          >
            Create your first list
            <span aria-hidden="true">↗</span>
          </button>
        </div>

        <!-- Existing lists -->
        <div
          v-else
          class="lists-stack"
        >
          <TaskListCard
            v-for="list in lists"
            :key="list.id"
            :list="list"
            :is-saving="isSaving"
            @edit-task="handleEditTask"
            @delete-task="openDeleteTaskDialog"
            @delete-list="openDeleteListDialog"
            @rename-list="openRenameList"
          />
        </div>

      </section>

      <!-- BOX 4: Units - bottom right -->
      <section
        class="dashboard-panel units-panel"
        aria-labelledby="units-heading"
      >
        <header class="units-panel-header">
          <h2 id="units-heading">Unit</h2>
        </header>

        <UnitSelect
          v-model="selectedUnit"
          label=""
          :allow-default="true"
          compact
        />
      </section>
    </section>


    <!-- Create and rename list dialog -->
    <ListDialog
      :open="isListDialogOpen"
      :list-to-rename="listToRename"
      :is-saving="isSaving"
      @close="closeListDialog"
      @submit="submitList"
    />

    <DeleteConfirmationDialog
      :open="Boolean(deleteTarget)"
      :title="deleteConfirmation?.title ?? ''"
      :description="deleteConfirmation?.description ?? ''"
      :confirm-label="deleteConfirmation?.confirmLabel ?? ''"
      :is-saving="isSaving"
      @close="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </main>
</template>

<style scoped>
/*
 * Dashboard layout
 *
 * Row 1: Counter | Task Composer
 * Row 2: Task Lists | Units
 */

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: stretch;
}

.dashboard-panel {
  box-sizing: border-box;
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--color-border, #BCD9DF);
  border-radius: 1rem;
  background: var(--color-surface, #FFFFFF);
}

.counter-panel,
.composer-panel,
.lists-section,
.units-panel {
  min-width: 0;
}

.lists-section {
  display: flex;
  flex-direction: column;
}

.units-panel {
  display: flex;
  flex-direction: column;
  align-content: start;
  gap: 1rem;
}

.units-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.units-panel-header h2 {
  margin: 0.25rem 0 0.5rem;
  color: var(--color-text-primary, #121A42);
  font-size: 1.35rem;
}

/* Tablet and mobile layout */
@media (max-width: 800px) {
  .dashboard-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .dashboard-panel {
    padding: 1rem;
  }
}
</style>