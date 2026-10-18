<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  isSaving: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'confirm']);

function onKeydown(event) {
  if (props.open && event.key === 'Escape' && !props.isSaving) {
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

function onBackdrop(event) {
  if (event.target === event.currentTarget && !props.isSaving) {
    emit('close');
  }
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" role="presentation" @click="onBackdrop">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-confirmation-title">
      <h2 id="delete-confirmation-title">{{ title }}</h2>
      <p class="modal-description">{{ description }}</p>
      <div class="modal-actions">
        <button
          class="button button-quiet"
          type="button"
          :disabled="isSaving"
          autofocus
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          class="button button-danger"
          type="button"
          :disabled="isSaving"
          @click="emit('confirm')"
        >
          {{ isSaving ? 'Deleting…' : confirmLabel }}
        </button>
      </div>
    </section>
  </div>
</template>
