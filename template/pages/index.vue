<template>
  <visitor-info :currentDevice="currentDevice" />
</template>

<script>
import { mapGetters } from 'vuex'
import visitorInfo from '@/components/visitor-info'

export default {
  components: {
    visitorInfo,
  },
  computed: {
    ...mapGetters({
      currentDevice: 'devices/currentDevice',
    }),
  },
}
</script>
