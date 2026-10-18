<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  count: { type: Number, required: true },
  clearSignal: { type: Number, default: 0 },
});
const emit = defineEmits(['increment', 'decrement', 'reset']);
const canvasElement = ref(null);
let context = null;
let isDrawing = false;
let resizeObserver = null;
let lastPoint = null;

function setupCanvas() {
  const canvas = canvasElement.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.strokeStyle = '#1d4ed8';
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.clearRect(0, 0, rect.width, rect.height);
}

function pointFromEvent(event) {
  const rect = canvasElement.value.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function startDrawing(event) {
  if (event.button !== undefined && event.button !== 0) return;
  const canvas = canvasElement.value;
  if (!canvas || !context) return;
  isDrawing = true;
  lastPoint = pointFromEvent(event);
  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  canvas.setPointerCapture?.(event.pointerId);
  emit('increment');
}

function draw(event) {
  if (!isDrawing || !context) return;
  const point = pointFromEvent(event);
  context.lineTo(point.x, point.y);
  context.stroke();
  lastPoint = point;
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

function clearCanvas() {
  const canvas = canvasElement.value;
  if (canvas && context) {
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
  }
}

watch(() => props.clearSignal, clearCanvas);
onMounted(() => {
  setupCanvas();
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(setupCanvas);
    resizeObserver.observe(canvasElement.value);
  } else {
    window.addEventListener('resize', setupCanvas);
  }
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', setupCanvas);
});
</script>

<template>
  <section class="panel counter-panel" aria-label="Counter">
    <div class="count-display" aria-live="polite" aria-atomic="true">{{ count }}</div>

    <div class="canvas-wrap">
      <canvas
        ref="canvasElement"
        class="counter-canvas"
        aria-label="Draw inside this area. Each new stroke adds one to the counter."
        @pointerdown="startDrawing"
        @pointermove="draw"
        @pointerup="stopDrawing"
        @pointercancel="stopDrawing"
        @lostpointercapture="stopDrawing"
      ></canvas>
    </div>

    <div class="counter-controls" aria-label="Counter controls">
      <button class="control-button control-minus" type="button" aria-label="Decrease count" :disabled="count === 0" @click="emit('decrement')">−</button>
      <button class="control-button control-plus" type="button" aria-label="Increase count" @click="emit('increment')">+</button>
      <button class="control-reset" type="button" @click="emit('reset')">Reset</button>
    </div>
  </section>
</template>
