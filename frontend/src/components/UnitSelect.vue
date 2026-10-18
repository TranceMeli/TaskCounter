<script setup>
import { computed, ref, useId, watch } from "vue";
import { COMMON_UNITS } from "../constants/units.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "Unit",
  },
  allowDefault: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const customInputId = useId();
const showAllUnits = ref(false);
const customMode = ref(false);
const customValue = ref("");

const availableUnits = computed(() =>
  props.allowDefault
    ? COMMON_UNITS
    : COMMON_UNITS.filter((unit) => unit.value !== "")
);

const quickUnitValues = [
  "Stück",
  "Packung",
  "kg",
  "g",
  "l",
  "ml",
  "Stunden",
  "Portionen",
];

const quickUnits = computed(() => {
  const preferred = quickUnitValues
    .map((value) =>
      availableUnits.value.find((unit) => unit.value === value)
    )
    .filter(Boolean);

  return preferred.length
    ? preferred
    : availableUnits.value.slice(0, 8);
});

const remainingUnits = computed(() =>
  availableUnits.value.filter(
    (unit) =>
      unit.value !== "" &&
      !quickUnits.value.some(
        (quickUnit) => quickUnit.value === unit.value
      )
  )
);

const isKnownUnit = computed(() =>
  availableUnits.value.some(
    (unit) => unit.value === props.modelValue
  )
);

watch(
  () => props.modelValue,
  (value) => {
    customMode.value =
      value !== "" &&
      !availableUnits.value.some((unit) => unit.value === value);

    customValue.value = customMode.value ? value : "";
  },
  { immediate: true }
);

function selectUnit(value) {
  customMode.value = false;
  customValue.value = "";
  emit("update:modelValue", value);
}

function openCustomUnit() {
  customMode.value = true;
  customValue.value =
    !isKnownUnit.value && props.modelValue !== ""
      ? props.modelValue
      : "";
}

function updateCustomUnit() {
  emit("update:modelValue", customValue.value.trim());
}

function chooseFromList() {
  selectUnit("");
}
</script>

<template>
  <section
    class="unit-select"
    :class="{ 'unit-select-compact': compact }"
  >
    <div v-if="label" class="unit-select-heading">
      <span class="unit-select-label">{{ label }}</span>
    </div>

    <div class="unit-options">
      <button
        v-if="allowDefault"
        type="button"
        class="unit-option unit-option-default"
        :class="{
          'is-selected': modelValue === '' && !customMode,
        }"
        :aria-pressed="modelValue === '' && !customMode"
        @click="selectUnit('')"
      >
        List default
      </button>

      <button
        v-for="unit in quickUnits"
        :key="unit.value"
        type="button"
        class="unit-option"
        :class="{
          'is-selected':
            modelValue === unit.value && !customMode,
        }"
        :aria-pressed="
          modelValue === unit.value && !customMode
        "
        @click="selectUnit(unit.value)"
      >
        {{ unit.label }}
      </button>
    </div>

    <div class="unit-actions">
      <button
        type="button"
        class="unit-action"
        :aria-expanded="showAllUnits"
        @click="showAllUnits = !showAllUnits"
      >
        {{ showAllUnits ? "Show fewer units" : "Show all units" }}
        <span aria-hidden="true">
          {{ showAllUnits ? "−" : "+" }}
        </span>
      </button>

      <button
        type="button"
        class="unit-action"
        :aria-pressed="customMode"
        @click="openCustomUnit"
      >
        Custom unit
        <span aria-hidden="true">＋</span>
      </button>
    </div>

    <div v-if="showAllUnits" class="unit-options all-units">
      <button
        v-for="unit in remainingUnits"
        :key="unit.value"
        type="button"
        class="unit-option"
        :class="{
          'is-selected':
            modelValue === unit.value && !customMode,
        }"
        :aria-pressed="
          modelValue === unit.value && !customMode
        "
        @click="selectUnit(unit.value)"
      >
        {{ unit.label }}
      </button>
    </div>

    <div v-if="customMode" class="custom-unit">
      <label :for="customInputId">
        Your custom unit
      </label>

      <input
        :id="customInputId"
        v-model="customValue"
        type="text"
        maxlength="50"
        placeholder="e.g. chapters, sessions"
        @input="updateCustomUnit"
      />

      <button
        type="button"
        class="unit-action"
        @click="chooseFromList"
      >
        {{ allowDefault ? "Use list default" : "Clear selection" }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.unit-select {
  display: grid;
  align-content: start;
  gap: 1rem;
  min-width: 0;
}

.unit-select-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.unit-select-label {
  color: var(--color-text-primary, #121A42);
  font-weight: 700;
}

.unit-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.unit-option {
  min-height: 2.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #BCD9DF);
  border-radius: 0.65rem;
  background: var(--color-surface, #FFFFFF);
  color: var(--color-text-primary, #121A42);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.unit-option:hover {
  border-color: var(--color-primary, #4274D9);
  background: var(--color-surface-subtle, #D0E7E6);
}

.unit-option.is-selected {
  border-color: var(--color-primary, #4274D9);
  background: var(--color-primary, #4274D9);
  color: #FFFFFF;
}

.unit-option-default {
  border-style: dashed;
}

.unit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.unit-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0;
  border: 0;
  background: transparent;
  color: var(--color-primary, #4274D9);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.unit-action:hover {
  color: var(--color-primary-dark, #293681);
}

.custom-unit {
  display: grid;
  gap: 0.5rem;
}

.custom-unit label {
  color: var(--color-text-secondary, #293681);
  font-size: 0.875rem;
  font-weight: 600;
}

.custom-unit input {
  box-sizing: border-box;
  width: 100%;
  min-height: 2.5rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border, #BCD9DF);
  border-radius: 0.6rem;
  background: var(--color-surface, #FFFFFF);
  color: var(--color-text-primary, #121A42);
  font: inherit;
}

.custom-unit input:focus {
  outline: 2px solid var(--color-primary, #4274D9);
  outline-offset: 2px;
}

.unit-select-compact {
  gap: 0.75rem;
}
</style>