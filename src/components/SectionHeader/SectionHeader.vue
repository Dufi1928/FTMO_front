<script setup>
import './SectionHeader.css'

defineProps({
  title: {
    type: String,
    required: true
  },
  linkText: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="section-header">
    <div class="container">
      <h2 class="section-title">{{ title }}</h2>
      <a :href="linkUrl" class="section-link">
        {{ linkText }}
        <img src="../../assets/icons/arrow-right.svg" alt="→">
      </a>
    </div>
  </div>
</template>
