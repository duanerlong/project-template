<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="accounts"
          sort-by="created_at"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>管理アカウント一覧</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="secondary" class="mb-2" v-bind="attrs" v-on="on"
                    >新規追加</v-btn
                  >
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">アカウント登録</span>
                  </v-card-title>
                  <v-spacer></v-spacer>
                  <v-card-text>
                    <v-container>
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        type="email"
                        hide-details="auto"
                        :rules="[rules.required, rules.email]"
                      ></v-text-field>
                      <v-text-field
                        v-model="editedItem.password"
                        label="Password"
                        type="password"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn dark color="grey lighten-1" @click="close"
                      >戻る</v-btn
                    >
                    <v-btn dark color="secondary" @click="save()">保存</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:[`item.type`]="{ item }">
            {{ item.type | formatType }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              color="secondary"
              class="mx-7"
              min-width="80"
              small
              @click="moveToDetail(item)"
              >情報詳細</v-btn
            >
            <v-btn
              color="error"
              class="mx-7"
              min-width="80"
              small
              @click="deleteAccount(item)"
              >削除</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-btn color="secondary" @click="initialize">Reset</v-btn>
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
  async asyncData({ $axios }) {
    const res = await $axios.get('/activestreamhc/accounts').catch((err) => {
      console.log(err)
    })
    let data = []
    if (res) {
      data = res.data
    }
    return { accounts: data }
  },
  data() {
    return {
      dialog: false,
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
      editedIndex: -1,
      editedItem: {},
      deletedItem: {},
      rules: {
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 20 || 'Max 20 characters',
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (
            pattern.test(value) || '正しいメールアドレスを入力してください。'
          )
        },
      },
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  methods: {
    async initData() {
      const res = await this.$axios
        .get('/activestreamhc/accounts')
        .catch((err) => {
          console.log(err)
        })
      this.accounts = res.data
    },

    moveToDetail(item) {
      this.$router.push(`/admin/account/${item.uid}`)
    },

    deleteAccount(item) {
      this.$refs.dlg.isDisplay = true
      this.deletedItem = item
    },

    async confirmDeletion() {
      const { data } = await this.$axios
        .delete('/activestreamhc/accounts/delete', {
          data: this.deletedItem,
        })
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        await this.initData()
      }
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = {}
        this.editedIndex = -1
      })
    },

    async save() {
      if (this.editedIndex === -1) {
        const { data } = await this.$axios
          .post('/activestreamhc/accountadd', this.editedItem)
          .catch((err) => {
            console.log(err)
          })
        if (data.result) {
          await this.initData()
          this.close()
        }
      }
    },
  },
}
</script>
