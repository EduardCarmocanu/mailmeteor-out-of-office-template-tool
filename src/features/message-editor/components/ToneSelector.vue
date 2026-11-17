<script setup lang="ts">
import { useId } from 'vue'
import SwitchBar from '../../../shared/components/SwitchBar.vue';
import InputLabel from '../../../shared/components/InputLabel.vue';

const tone = defineModel({ default: 'formal' })
const id = useId()
</script>

<template>
    <InputLabel :for="id">Tone</InputLabel>
    <SwitchBar v-model="tone" :options="[
        { label: 'Formal', value: 'formal' },
        { label: 'Friendly', value: 'friendly' },
        { label: 'Funny', value: 'funny' },
        { label: 'Short', value: 'short' },
    ]" />
</template>