<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-card width="897" min-height="490" class="pa-5 mx-auto">
        <v-card-title class="text-h6">
          カスタマイズカラム設定
        </v-card-title>
        <v-card-text class="py-3">
          <v-row v-for="(item, index) in settings" :key="index" no-gutters>
            <v-col md="9">
              <v-text-field
                v-model="item.label"
                :label="item.label || item.field"
              ></v-text-field>
            </v-col>
            <v-col md="2" offset-md="1">
              <v-switch
                v-model="item.required"
                :label="item.required ? '必須' : '非必須'"
              ></v-switch>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            class="white--text"
            min-width="80"
            small
            @click="moveToUsers"
            >戻る</v-btn
          >
          <v-btn color="secondary" min-width="80" small @click="save"
            >保存</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'admin',
  async asyncData({ $axios }) {
    const res = await $axios
      .get(`/activestreamhc/usersettings`)
      .catch((err) => {
        console.log(err)
      })

    let data = {}
    if (res) {
      data = res.data
    }
    return { settings: data.settings }
  },
  methods: {
    moveToUsers() {
      this.$router.push('/admin/user')
    },
    async save() {
      await this.$axios
        .post(`/activestreamhc/usersettings`, {
          settings: this.settings,
        })
        .catch((err) => {
          console.log(err)
        })
      this.moveToUsers()
    },
  },
}
</script>
