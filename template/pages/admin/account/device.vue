<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="devices"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ title }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                color="secondary"
                class="mb-2"
                min-width="80"
                @click="onConfiguration"
                >設定</v-btn
              >
            </v-toolbar>
          </template>
          <template v-slot:item.devicelabel="{ item }">
            <v-row class="pl-3">
              <v-radio-group v-if="singleSelect" v-model="selected" column>
                <v-radio
                  :label="item.devicelabel"
                  :value="item.serialno"
                ></v-radio>
              </v-radio-group>
              <v-checkbox
                v-else-if="!singleSelect"
                v-model="selected"
                :label="item.devicelabel"
                :value="item.serialno"
              ></v-checkbox>
            </v-row>
          </template>
          <template v-slot:no-data>
            <span>該当データが存在しません</span>
          </template>
        </v-data-table>
      </client-only>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'admin',
  async asyncData({ params, query, $axios }) {
    const res = await $axios.get('/activestreamhc/devices').catch((err) => {
      console.log(err)
    })
    let data = []
    if (res) {
      data = res.data
    }
    let selected = params.devices || []
    if (query.type === 0 || query.type === 3) {
      selected = selected[0]
    }
    return {
      devices: data,
      type: query.type,
      uid: query.uid,
      selected,
    }
  },
  data() {
    return {
      title: 'デバイス権限設定',
      headers: [
        { text: 'デバイス名', align: 'left', value: 'devicelabel' },
        { text: 'SerialNo', align: 'center', value: 'serialno' },
      ],
    }
  },
  computed: {
    singleSelect() {
      return this.type === 0 || this.type === 3
    },
  },
  methods: {
    onConfiguration() {
      let devices = []
      if (this.singleSelect) {
        if (this.selected) {
          devices.push(this.selected)
        }
      } else {
        devices = this.selected
      }
      this.$router.push({
        name: 'admin-account-uid',
        params: { uid: this.uid, devices, type: this.type },
      })
    },
  },
}
</script>
