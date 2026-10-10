<script setup lang="ts">
import type { Instance } from 'flatpickr/dist/types/instance'
import type { BaseOptions } from 'flatpickr/dist/types/options'
import type { PropType } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue'
import FlatPickr from 'vue-flatpickr-component'
import { useTheme } from 'vuetify'
import { VField } from 'vuetify/components/VField'
import { VInput } from 'vuetify/components/VInput'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  autofocus: Boolean,
  prefix: String,
  placeholder: String,
  suffix: String,
  label: String,
  id: String,
  hint: String,
  persistentHint: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  clearable: Boolean,
  dirty: Boolean,
  error: Boolean,
  errorMessages: {
    type: [String, Array] as PropType<string | readonly string[]>,
    default: () => [],
  },
  prependInnerIcon: String,
  appendInnerIcon: String,
  density: {
    type: String as PropType<'default' | 'comfortable' | 'compact'>,
    default: 'compact',
  },
  hideDetails: {
    type: [Boolean, String] as PropType<boolean | 'auto'>,
    default: 'auto',
  },
  variant: {
    type: String as PropType<'outlined' | 'filled' | 'underlined' | 'plain' | 'solo' | 'solo-inverted' | 'solo-filled'>,
    default: 'outlined',
  },
  color: {
    type: String,
    default: 'primary',
  },
  modelValue: {
    type: [String, Number, Date, Array] as PropType<string | number | Date | string[] | null>,
    default: null,
  },
  config: {
    type: Object as PropType<Partial<BaseOptions>>,
    default: () => ({}),
  },
})

const emit = defineEmits<{
  (event: 'click:control', value: MouseEvent): void
  (event: 'mousedown:control', value: MouseEvent): void
  (event: 'update:focused', value: boolean): void
  (event: 'update:modelValue', value: string): void
  (event: 'click:clear', value: MouseEvent): void
}>()

const attrs = useAttrs()
const vuetifyTheme = useTheme()
const refFlatPicker = ref<{ fp: Instance | null } | null>(null)
const focused = ref(false)
const isCalendarOpen = ref(false)
const idSuffix = Math.random().toString(36).slice(2, 7)

const normalizedModelValue = computed(() => props.modelValue ?? null)

const pickerConfig = computed(() => {
  const inline = props.config.inline === true

  return {
    disableMobile: true,
    ...props.config,
    altInputClass: inline ? 'inlinePicker' : 'flat-picker-custom-style',
    prevArrow: '<i class="mdi mdi-chevron-left v-icon" style="font-size: 20px; height: 20px; width: 20px;"></i>',
    nextArrow: '<i class="mdi mdi-chevron-right v-icon" style="font-size: 20px; height: 20px; width: 20px;"></i>',
  }
})

const isInlinePicker = computed(() => pickerConfig.value.inline === true)

const fieldLabel = computed(() => props.label ?? '')

const elementId = computed(() => {
  const token = props.id || fieldLabel.value

  return token ? `app-picker-field-${token}-${idSuffix}` : undefined
})

function onClear(event: MouseEvent): void {
  event.stopPropagation()
  nextTick(() => {
    emit('update:modelValue', '')
    emit('click:clear', event)
  })
}

function emitModelValue(value: string): void {
  emit('update:modelValue', value)
}

function onCalendarOpen(): void {
  isCalendarOpen.value = true
  nextTick(() => {
    updateThemeClassInCalendar()
  })
}

function onCalendarClose(): void {
  isCalendarOpen.value = false
  focused.value = false
}

const themeNames = Object.keys(vuetifyTheme.themes.value)

function updateThemeClassInCalendar(): void {
  const calendarContainer = refFlatPicker.value?.fp?.calendarContainer
  if (!calendarContainer) {
    return
  }
  themeNames.forEach((name) => {
    calendarContainer.classList.remove(`v-theme--${name}`)
  })
  calendarContainer.classList.add(`v-theme--${vuetifyTheme.global.name.value}`)
  if (
    calendarContainer.classList.contains('flatpickr-monthSelect-theme-light')
    || calendarContainer.classList.contains('flatpickr-monthSelect-theme-dark')
  ) {
    calendarContainer.classList.remove('flatpickr-monthSelect-theme-light')
    calendarContainer.classList.remove('flatpickr-monthSelect-theme-dark')
    calendarContainer.classList.add(`flatpickr-monthSelect-theme-${vuetifyTheme.global.name.value}`)
  }
}

function repositionCalendar(): void {
  const fpInstance = refFlatPicker.value?.fp
  if (fpInstance?.isOpen) {
    fpInstance._positionCalendar()
  }
}

watch(() => vuetifyTheme.global.name.value, updateThemeClassInCalendar)

onMounted(() => {
  updateThemeClassInCalendar()
  window.visualViewport?.addEventListener('resize', repositionCalendar)
})

onUnmounted(() => {
  window.visualViewport?.removeEventListener('resize', repositionCalendar)
})
</script>

<template>
  <div
    class="app-picker-field"
    :class="attrs.class"
  >
    <VLabel
      v-if="fieldLabel"
      class="mb-1 text-body-2"
      :for="elementId"
      :text="fieldLabel"
    />

    <VInput
      :model-value="normalizedModelValue"
      :hide-details="props.hideDetails"
      :density="props.density"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :error="props.error"
      :error-messages="props.errorMessages"
      :hint="props.hint"
      :persistent-hint="props.persistentHint"
      class="position-relative v-text-field"
      :class="[{
        'v-text-field--prefixed': props.prefix,
        'v-text-field--suffixed': props.suffix,
        'v-text-field--flush-details': props.variant === 'plain' || props.variant === 'underlined',
      }]"
    >
      <template #default="{ id, isDirty, isValid, isDisabled, isReadonly }">
        <VField
          :id="id.value"
          role="textbox"
          :variant="props.variant"
          :color="props.color"
          :clearable="props.clearable"
          :prepend-inner-icon="props.prependInnerIcon"
          :append-inner-icon="props.appendInnerIcon"
          :active="focused || isDirty.value || isCalendarOpen"
          :focused="focused || isCalendarOpen"
          :dirty="isDirty.value || props.dirty"
          :error="isValid.value === false"
          :disabled="isDisabled.value"
          @click:clear="onClear"
        >
          <template #default="{ props: vFieldProps }">
            <div
              v-bind="vFieldProps"
              @focusin="focused = true"
              @focusout="focused = false"
            >
              <FlatPickr
                v-if="!isInlinePicker"
                ref="refFlatPicker"
                :model-value="normalizedModelValue"
                :config="pickerConfig"
                :placeholder="props.placeholder"
                :readonly="isReadonly.value"
                class="flat-picker-custom-style h-100 w-100"
                :disabled="isReadonly.value"
                @on-open="onCalendarOpen"
                @on-close="onCalendarClose"
                @update:model-value="emitModelValue"
              />

              <input
                v-if="isInlinePicker"
                :value="normalizedModelValue"
                :placeholder="props.placeholder"
                :readonly="isReadonly.value"
                class="flat-picker-custom-style h-100 w-100"
                type="text"
              >
            </div>
          </template>
        </VField>
      </template>
    </VInput>

    <FlatPickr
      v-if="isInlinePicker"
      ref="refFlatPicker"
      :model-value="normalizedModelValue"
      :config="pickerConfig"
      @update:model-value="emitModelValue"
      @on-open="onCalendarOpen"
      @on-close="onCalendarClose"
    />
  </div>
</template>

<style>
@import 'flatpickr/dist/flatpickr.css';
@import 'flatpickr/dist/plugins/monthSelect/style.css';

.flat-picker-custom-style {
  position: absolute;
  border: none;
  background: transparent;
  box-shadow: none;
  color: inherit;
  font: inherit;
  inline-size: 100%;
  inset: 0;
  outline: none;
  padding-block: 0;
  padding-inline: var(--v-field-padding-start);
}

.app-picker-field {
  inline-size: 100%;
}

input[altinputclass='inlinePicker'],
input.inlinePicker {
  display: none;
}

.flatpickr-time input.flatpickr-hour {
  font-weight: 400;
}

.flatpickr-calendar {
  --picker-heading: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  --picker-body: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));

  background-color: rgb(var(--v-theme-surface));
  box-shadow:
    0 3px 5px -1px rgb(0 0 0 / 20%),
    0 6px 10px 0 rgb(0 0 0 / 14%),
    0 1px 18px 0 rgb(0 0 0 / 12%);
  inline-size: 16.875rem;

  .flatpickr-day:focus {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .flatpickr-rContainer .flatpickr-weekdays {
    block-size: 1.25rem;
    padding-inline: 0.5625rem;
  }

  .flatpickr-rContainer .flatpickr-days {
    min-inline-size: 16.875rem;

    .dayContainer {
      justify-content: center !important;
      inline-size: 16.875rem;
      min-inline-size: 16.875rem;
      padding-block: 0.75rem 0.5rem;

      .flatpickr-day {
        block-size: 2.25rem;
        font-size: 0.9375rem;
        line-height: 2.25rem;
        margin-block-start: 0 !important;
        max-inline-size: 2.25rem;
      }
    }
  }

  .flatpickr-day {
    color: var(--picker-body);

    &.today:not(.selected),
    &.today:hover {
      border: none !important;
      background: rgba(var(--v-theme-primary), 0.24);
      color: rgb(var(--v-theme-primary));
    }

    &.selected,
    &.selected:hover,
    &.startRange,
    &.endRange,
    &.startRange:hover,
    &.endRange:hover {
      border-color: rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
      box-shadow: 0 2px 6px 0 rgba(var(--v-theme-primary), 0.3);
      color: rgb(var(--v-theme-on-primary));
    }

    &.inRange,
    &.inRange:hover {
      border: none;
      background: rgba(var(--v-theme-primary), var(--v-activated-opacity)) !important;
      box-shadow: none !important;
      color: rgb(var(--v-theme-primary));
    }

    &.selected.startRange + .endRange:not(:nth-child(7n + 1)),
    &.startRange.startRange + .endRange:not(:nth-child(7n + 1)),
    &.endRange.startRange + .endRange:not(:nth-child(7n + 1)) {
      box-shadow: -10px 0 0 rgb(var(--v-theme-primary));
    }

    &.flatpickr-disabled,
    &.prevMonthDay:not(.startRange, .inRange),
    &.nextMonthDay:not(.endRange, .inRange) {
      opacity: var(--v-disabled-opacity);
    }

    &:hover {
      border-color: transparent;
      background: rgba(var(--v-theme-on-surface), 0.06);
    }
  }

  .flatpickr-weekday {
    color: var(--picker-heading);
    font-size: 0.8125rem;
    font-weight: 400;
    inline-size: 2.25rem;
    line-height: 1.25rem;
  }

  .flatpickr-days {
    inline-size: 16.875rem;
  }

  &::after,
  &::before {
    display: none;
  }

  .flatpickr-months {
    .flatpickr-prev-month,
    .flatpickr-next-month {
      color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
      fill: var(--picker-body);

      &:hover {
        color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
      }

      &:hover i,
      &:hover svg {
        fill: var(--picker-body);
      }
    }
  }

  .flatpickr-current-month span.cur-month {
    font-weight: 300;
  }

  &.open {
    z-index: 2401;
  }

  &.hasTime.open {
    .flatpickr-innerContainer + .flatpickr-time {
      block-size: auto;
      border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }

    .flatpickr-time {
      border-block-start: none;
    }

    .flatpickr-hour,
    .flatpickr-minute,
    .flatpickr-am-pm {
      font-size: 0.9375rem;
    }
  }
}

.flatpickr-monthSelect-theme-dark,
.flatpickr-monthSelect-theme-light {
  inline-size: 18.875rem;
}

.v-theme--dark .flatpickr-calendar,
.flatpickr-calendar.v-theme--dark {
  box-shadow: 0 3px 14px 0 rgb(15 20 34 / 38%);
}

.flatpickr-time input:hover,
.flatpickr-time .flatpickr-am-pm:hover,
.flatpickr-time input:focus,
.flatpickr-time .flatpickr-am-pm:focus {
  background: transparent;
}

.flatpickr-time {
  .flatpickr-am-pm,
  .flatpickr-time-separator,
  input {
    color: var(--picker-body, rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity)));
  }

  .numInputWrapper span.arrowUp::after {
    border-block-end-color: rgb(var(--v-border-color));
  }

  .numInputWrapper span.arrowDown::after {
    border-block-start-color: rgb(var(--v-border-color));
  }
}

.flatpickr-input[readonly],
.flatpickr-input ~ .form-control[readonly],
.flatpickr-human-friendly[readonly] {
  background-color: inherit;
}

.flatpickr-weekdays {
  margin-block: 0.375rem;
}

.flatpickr-current-month {
  .flatpickr-monthDropdown-months {
    appearance: none;
  }

  .flatpickr-monthDropdown-months,
  .numInputWrapper {
    padding: 2px;
    border-radius: 4px;
    color: var(--picker-heading, rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity)));
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.375rem;
    transition: all 0.15s ease-out;

    span {
      display: none;
    }

    .flatpickr-monthDropdown-month {
      background-color: rgb(var(--v-theme-surface));
    }

    .numInput.cur-year {
      font-weight: 400;
    }
  }
}

.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover {
  color: var(--picker-body, rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity)));
}

.flatpickr-months {
  padding-block: 0.75rem;
  padding-inline: 1rem;

  .flatpickr-prev-month,
  .flatpickr-next-month {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 5rem;
    background: rgba(var(--v-theme-on-surface), var(--v-selected-opacity));
    block-size: 1.875rem;
    inline-size: 1.875rem;
    inset-block-start: 15px !important;

    &.flatpickr-disabled {
      display: inline;
      opacity: var(--v-disabled-opacity);
      pointer-events: none;
    }
  }

  .flatpickr-next-month {
    inset-inline-end: 1.05rem !important;
  }

  .flatpickr-prev-month {
    right: 3.65rem;
    left: unset !important;
  }

  .flatpickr-month {
    display: flex;
    align-items: center;
    block-size: 2.125rem;

    .flatpickr-current-month {
      display: flex;
      align-items: center;
      padding: 0;
      block-size: 1.75rem;
      inset-inline-start: 0;
      text-align: start;
    }
  }
}

.numInputWrapper span {
  display: flex !important;
}
</style>
