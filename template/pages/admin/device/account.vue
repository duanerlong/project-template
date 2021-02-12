<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="accounts"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title
                >{{ title }}&nbsp;{{ device.devicelabel }}&nbsp;{{
                  device.serialno
                }}</v-toolbar-title
              >
            </v-toolbar>
          </template>
          <template v-slot:[`item.type`]="{ item }">
            {{ item.type | formatType }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              color="error"
              class="mx-7"
              min-width="80"
              small
              @click="onDelete(item)"
              >権限削除</v-btn
            >
          </template>
          <template v-slot:no-data>
            <span>該当データが存在しません</span>
          </template>
        </v-data-table>
      </client-only>
      <confirmDialog ref="dlg" @confirm="confirmDeletion"></confirmDialog>
    </v-col>
  </v-row>
</template>

<script>
import confirmDialog from '@/components/confirm-dialog'
export default {
  layout: 'admin',
  components: {
    confirmDialog,
  },
  async asyncData({ params, query, $axios }) {
    const res = await $axios
      .get(`/activestreamhc/device/accounts/${query.serialno}`)
      .catch((err) => {
        console.log(err)
      })
    let data = {}
    if (res) {
      data = res.data
    }
    return {
      accounts: data.accounts,
    }
  },
  data() {
    return {
      title: 'デバイス利用アカウント',
      headers: [
        {
          text: 'Email',
          align: 'center',
          value: 'email',
        },
        { text: '名前', align: 'center', value: 'name' },
        { text: '権限', align: 'center', value: 'type' },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      deletedItem: {},
    }
  },
  computed: {
    device() {
      return this.accounts[0] || {}
    },
  },
  methods: {
    onDelete(item) {
      this.$refs.dlg.isDisplay = true
      this.deletedItem = item
    },
    async confirmDeletion() {
      const { data } = await this.$axios
        .delete('/activestreamhc/device/accounts/delete', {
          data: this.deletedItem,
        })
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        await this.initData()
      }
    },
    async initData() {
      const { data } = await this.$axios
        .get(`/activestreamhc/device/accounts/${this.device.serialno}`)
        .catch((err) => {
          console.log(err)
        })
      this.accounts = data.accounts
    },
  },
}
</script>
