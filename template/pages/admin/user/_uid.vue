<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <user-detail
        :file.sync="file"
        :member="member"
        @delete="onDelete"
        @save="onSave"
        @back="onBack"
      />
    </v-col>
  </v-row>
</template>

<script>
import userDetail from '@/components/user-detail'

export default {
  layout: 'admin',
  components: {
    userDetail,
  },
  async asyncData({ params, $axios }) {
    const res = await $axios
      .get(`/activestreamhc/user/${params.uid}`)
      .catch((err) => {
        console.log(err)
      })
    let member = {}
    if (res) {
      member = res.data.member
    }
    return { member: { ...member } }
  },
  data() {
    return {
      file: null,
    }
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async onDelete() {
      const { data } = await this.$axios
        .post(`/activestreamhc/userdelete/${this.member.uid}`)
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        this.onBack()
      }
    },
    async onSave() {
      const formData = new FormData()
      if (this.file) {
        formData.append('file', this.file, this.file.name)
      }
      // additional data
      formData.append('member', JSON.stringify(this.member))
      const { data } = await this.$axios
        .post(`/activestreamhc/userupdate/${this.member.uid}`, formData)
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        this.onBack()
      }
    },
  },
}
</script>
