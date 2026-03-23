<script setup>
const props = defineProps({
  channel: Object,
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

function onToggle() {
  console.log(props.disabled)
  emit('toggle', props.channel)
}
</script>

<template>
  <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow">
    <span class="text-gray-200">{{ channel.name }}</span>

    <button
      @click="onToggle"
      :disabled="disabled"
      class="px-3 py-1 rounded text-sm font-medium transition"
      :class="[
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        channel.subscribed
          ? 'bg-green-600 hover:bg-green-500 text-white'
          : 'bg-gray-600 hover:bg-gray-500 text-white'
      ]"
    >
      {{ channel.subscribed ? 'ON' : 'OFF' }}
    </button>
  </div>
</template>
