import { computed, ref } from 'vue';
import { getApiError } from '../services/api';
import { taskCounterApi } from '../services/taskCounterApi';

export function useTaskCounter() {
  const lists = ref([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const errorMessage = ref('');
  const statusMessage = ref('');
  const hasLoadError = ref(false);

  const taskCount = computed(() =>
    lists.value.reduce(
      (total, list) => total + (list.tasks?.length ?? 0),
      0,
    ),
  );

  const savedCount = computed(() =>
    lists.value.reduce(
      (total, list) =>
        total +
        (list.tasks ?? []).reduce(
          (listTotal, task) => listTotal + (Number(task.count) || 0),
          0,
        ),
      0,
    ),
  );

  function clearMessages() {
    errorMessage.value = '';
    statusMessage.value = '';
  }

  async function refreshLists({ quiet = false } = {}) {
    if (!quiet) isLoading.value = true;

    errorMessage.value = '';

    try {
      lists.value = await taskCounterApi.getLists();
      hasLoadError.value = false;
    } catch (error) {
      errorMessage.value = getApiError(error);
      hasLoadError.value = true;
    } finally {
      if (!quiet) isLoading.value = false;
    }
  }

  async function runMutation(action, successMessage) {
    clearMessages();
    isSaving.value = true;

    try {
      await action();
      lists.value = await taskCounterApi.getLists();
      statusMessage.value = successMessage;
      return true;
    } catch (error) {
      errorMessage.value = getApiError(error);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  function createList(name) {
    return runMutation(
      () => taskCounterApi.createList(name),
      'List created.',
    );
  }

  function renameList(id, name) {
    return runMutation(
      () => taskCounterApi.renameList(id, name),
      'List updated.',
    );
  }

  function deleteList(id) {
    return runMutation(
      () => taskCounterApi.deleteList(id),
      'List deleted.',
    );
  }

  function saveTask(payload, taskId = null) {
    const action = taskId
      ? () => taskCounterApi.updateTask(taskId, payload)
      : () => taskCounterApi.createTask(payload);

    return runMutation(
      action,
      taskId ? 'Task updated.' : 'Task saved.',
    );
  }

  function deleteTask(taskId) {
    return runMutation(
      () => taskCounterApi.deleteTask(taskId),
      'Task deleted.',
    );
  }

  return {
    lists,
    isLoading,
    isSaving,
    errorMessage,
    statusMessage,
    hasLoadError,
    taskCount,
    savedCount,
    refreshLists,
    createList,
    renameList,
    deleteList,
    saveTask,
    deleteTask,
    clearMessages,
  };
}