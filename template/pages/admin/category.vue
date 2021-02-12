<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="categories"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>登録種別一覧</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" persistent max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="secondary" class="mb-2" v-bind="attrs" v-on="on"
                    >新規追加</v-btn
                  >
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">登録種別詳細</span>
                  </v-card-title>
                  <v-spacer></v-spacer>
                  <v-card-text>
                    <v-container>
                      <v-text-field
                        v-model="editedItem.name"
                        label="種別名"
                        type="text"
                      ></v-text-field>
                    </v-container>
                  </v-card-text>
                  <v-card-actions class="pb-6">
                    <v-dialog
                      v-if="editedIndex !== -1"
                      v-model="deleteDialog"
                      persistent
                      max-width="500px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="error"
                          min-width="80"
                          v-bind="attrs"
                          v-on="on"
                          >削除</v-btn
                        >
                      </template>
                      <v-card class="d-flex flex-column" height="358">
                        <v-card-title></v-card-title>
                        <v-spacer />
                        <v-icon x-large color="error" class="mb-3"
                          >fas fa-exclamation-triangle</v-icon
                        >
                        <v-card-text class="text-h6 text-center py-3">
                          本当に削除しますか?
                        </v-card-text>
                        <v-card-actions class="mb-12">
                          <v-spacer />
                          <v-btn
                            color="grey"
                            class="white--text"
                            min-width="80"
                            @click="deleteDialog = false"
                            >取消</v-btn
                          >
                          <v-btn color="error" min-width="80" @click="onDelete"
                            >実行する</v-btn
                          >
                          <v-spacer />
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn color="grey lighten-1" min-width="80" @click="close"
                      >戻る</v-btn
                    >
                    <v-btn
                      v-if="editedIndex === -1"
                      color="secondary"
                      min-width="80"
                      @click="onAdd"
                      >新規作成</v-btn
                    >
                    <v-btn
                      v-else-if="editedIndex !== -1"
                      color="secondary"
                      min-width="80"
                      @click="onSave"
                      >保存</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              color="success"
              class="ma-2"
              min-width="80"
              small
              @click="moveToUser(item)"
              >登録一覧</v-btn
            >
            <v-btn
              color="primary"
              class="ma-2"
              min-width="80"
              small
              @click="moveToLog(item)"
              >ログ一覧</v-btn
            >
            <v-btn
              color="secondary"
              class="ma-2"
              min-width="80"
              small
              :disabled="!item.uid"
              @click="editCategory(item)"
              >詳細設定</v-btn
            >
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
  async asyncData({ $axios }) {
    const res = await $axios.get('/activestreamhc/categories').catch((err) => {
      console.log(err)
    })
    let data = []
    if (res) {
      data = res.data
    }
    return { categories: data }
  },
  data() {
    return {
      dialog: false,
      deleteDialog: false,
      headers: [
        {
          text: '種別名',
          align: 'center',
          value: 'name',
        },
        { text: '登録数', align: 'center', value: 'cnt' },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      editedIndex: -1,
      editedItem: {},
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  methods: {
    editCategory(item) {
      this.editedIndex = this.categories.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    moveToLog(category) {
      this.$router.push({
        name: 'admin-log',
        params: {
          category,
        },
      })
    },

    moveToUser(category) {
      this.$router.push({
        name: 'admin-user',
        params: {
          category,
        },
      })
    },

    async onAdd() {
      await this.$axios
        .post(`/activestreamhc/categoryadd`, {
          ...this.editedItem,
        })
        .catch((err) => {
          console.log(err)
        })
      await this.reloadData()
      this.dialog = false
    },

    async onSave() {
      await this.$axios
        .post(`/activestreamhc/categoryupdate/${this.editedItem.uid}`, {
          ...this.editedItem,
        })
        .catch((err) => {
          console.log(err)
        })
      await this.reloadData()
      this.dialog = false
    },

    async onDelete() {
      await this.$axios
        .post(`/activestreamhc/categorydelete/${this.editedItem.uid}`)
        .catch((err) => {
          console.log(err)
        })
      await this.reloadData()
      this.dialog = false
      this.deleteDialog = false
    },

    async reloadData() {
      const res = await this.$axios
        .get('/activestreamhc/categories')
        .catch((err) => {
          console.log(err)
        })
      this.categories = res.data
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
  },
}
</script>
