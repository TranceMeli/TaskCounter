<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  listToRename: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'submit']);
const name = ref('');
const validationMessage = ref('');
const nameInput = ref(null);

watch(() => [props.open, props.listToRename], async ([open, list]) => {
  if (open) {
    name.value = list?.name ?? '';
    validationMessage.value = '';
    await nextTick();
    nameInput.value?.focus();
  }
});

function onKeydown(event) {
  if (props.open && event.key === 'Escape' && !props.isSaving) {
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

function submit() {
  const cleanName = name.value.trim();
  if (!cleanName) {
    validationMessage.value = 'A list name is required.';
    return;
  }
  if (cleanName.length > 100) {
    validationMessage.value = 'List names must be 100 characters or fewer.';
    return;
  }
  emit('submit', cleanName);
}

function onBackdrop(event) {
  if (event.target === event.currentTarget && !props.isSaving) emit('close');
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" role="presentation" @click="onBackdrop">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="list-dialog-title">
      <h2 id="list-dialog-title">{{ listToRename ? 'Rename list' : 'New list' }}</h2>
      <form @submit.prevent="submit">
        <label class="field-group">
          <span>List name</span>
          <input ref="nameInput" v-model="name" maxlength="100" type="text" placeholder="e.g. Everyday routines" />
        </label>
        <p v-if="validationMessage" class="inline-error" role="alert">{{ validationMessage }}</p>
        <div class="modal-actions">
          <button class="button button-quiet" type="button" :disabled="isSaving" @click="emit('close')">Cancel</button>
          <button class="button button-primary" type="submit" :disabled="isSaving">{{ isSaving ? 'Saving…' : listToRename ? 'Save changes' : 'Create list' }}</button>
        </div>
      </form>
    </section>
  </div>
</template>
