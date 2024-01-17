<script setup lang="ts">
import { ref, watch } from 'vue'
import { toRaw } from '@vue/reactivity'

const props = defineProps({
  modelValue: {
    // 父组件 v-model 没有指定参数名，则默认是 modelValue
    type: String || Number,
    default: '',
  },
  option: {
    type: <any>Array,
    default: [],
  },
  label: { type: String || Number, default: '' },
  value: { type: String || Number, default: '' },
})

const v = ref(props.modelValue)
watch(
  () => props.modelValue,
  () => {
    v.value = props.modelValue
  }
)
const emit = defineEmits(['update:modelValue','on-change'])

const change = (e) => {
  let selectOption = toRaw(props.option[e.target.selectedIndex])
  let value = selectOption[props.value]
  let label = selectOption[props.label]
  emit('update:modelValue', value)
  emit('on-change', label,value);

}
</script>

<template>
  <select v-model="v" @change="change">
    <option
      v-for="item in props.option"
      :value="item[value]"
      :key="item[label]"
    >
      {{ item[label] }}
    </option>
  </select>
</template>

<style lang="scss" scoped>
select {
  width: 100%;
  height: 45px;
  border-radius: 12px;
  padding: 5px 10px;
  border: var(--border-width) solid var(--border-color);
  background: var(--background-3);
  color: var(--text-color);
  font-size: 14px;
  line-height: 24px;
  box-sizing: border-box;
}

</style>
