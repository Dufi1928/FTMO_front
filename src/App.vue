<template>
  <component :is="Page" v-bind="pageProps" />
</template>

<script>
export default {
  props: ['Page', 'pageProps'],
  render() {
    return h(this.Page, this.pageProps)
  }
}
</script>
