<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="logs"
          class="elevation-1"
          :page.sync="page"
          :options.sync="options"
          :server-items-length="allrow"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>ログ一覧</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                color="secondary"
                class="mb-2"
                :loading="exporting"
                :disabled="exporting"
                @click="exportcsv"
                >CSV出力</v-btn
              >
            </v-toolbar>
            <v-form>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="3" class="d-flex justify-center">
                    <v-btn-toggle
                      color="secondary"
                      v-model="toggle_exclusive"
                      mandatory
                      class="ma-2"
                    >
                      <v-btn>
                        全部
                      </v-btn>
                      <v-btn>
                        昨日
                      </v-btn>
                      <v-btn>
                        本日
                      </v-btn>
                      <v-btn>
                        今月
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-menu
                      v-model="startMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      min-width="290px"
                      offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="conditions.fromDate"
                          class="mt-6"
                          label="From"
                          prepend-icon="far fa-calendar-alt"
                          placeholder="年月日"
                          dense
                          readonly
                          hide-details
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="conditions.fromDate"
                        no-title
                        scrollable
                        locale="ja"
                        @input="startMenu = false"
                      >
                      </v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-menu
                      v-model="endMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      min-width="290px"
                      offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="conditions.toDate"
                          class="mt-6"
                          label="To"
                          prepend-icon="far fa-calendar-alt"
                          placeholder="年月日"
                          dense
                          readonly
                          hide-details
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="conditions.toDate"
                        no-title
                        scrollable
                        locale="ja"
                        @input="endMenu = false"
                      >
                      </v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      v-model="conditions.serialno"
                      :items="deviceoptions"
                      item-text="devicelabel"
                      item-value="serialno"
                      label="デバイス"
                      outlined
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      v-model="conditions.temperature"
                      :items="temperatureoptions"
                      item-text="label"
                      item-value="value"
                      label="体温"
                      outlined
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      v-model="conditions.mask"
                      :items="maskoptions"
                      item-text="label"
                      item-value="value"
                      label="マスク"
                      outlined
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      v-model="conditions.sex"
                      :items="sexoptions"
                      item-text="label"
                      item-value="value"
                      label="性別"
                      outlined
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      v-model="conditions.state"
                      :items="categoryoptions"
                      item-text="name"
                      item-value="code"
                      label="登録種別"
                      outlined
                    ></v-select>
                  </v-col>
                </v-row>
                <div class="d-flex">
                  <v-chip
                    v-if="showUser"
                    class="ma-1"
                    close
                    @click:close="user = null"
                  >
                    {{ user.name }}
                  </v-chip>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    class="white--text ma-2"
                    min-width="100"
                    @click="clearConditions"
                    >クリア</v-btn
                  >
                  <v-btn
                    color="secondary"
                    class="ma-2"
                    min-width="100"
                    :loading="searching"
                    :disabled="searching"
                    @click="search"
                    >検索</v-btn
                  >
                </div>
              </v-container>
            </v-form>
          </template>
          <template v-slot:[`item.photo`]="{ item }">
            <v-img width="100" class="ma-2" :src="`/${item.photo}`" />
          </template>
          <template v-slot:[`item.serialno`]="{ item }">
            {{ item.devicelabel || item.serialno }}
          </template>
          <template v-slot:[`item.sex`]="{ item }">
            {{ item.sex | formatSex }}
          </template>
          <template v-slot:[`item.created_at`]="{ item }">
            {{ item.created_at | formatDate }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              v-if="item.uid === '0000'"
              color="success"
              class="ma-2"
              min-width="80"
              small
              @click="moveToAdd(item)"
              >顔登録</v-btn
            >
            <v-btn
              v-else-if="item.uid !== '0000'"
              color="secondary"
              class="ma-2"
              min-width="80"
              small
              @click="moveToDetail(item.uid)"
              >情報詳細</v-btn
            >
            <v-btn
              color="orange white--text"
              class="ma-2"
              min-width="80"
              small
              @click="openModifyDialog(item)"
              >認証修正</v-btn
            >
          </template>
          <template v-slot:no-data>
            <span>該当データが存在しません</span>
          </template>
        </v-data-table>
        <v-snackbar v-model="snackbar" :color="snackbarColor" top multi-line>
          {{ snackbarMessage }}

          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="snackbar = false">
              閉じる
            </v-btn>
          </template>
        </v-snackbar>
      </client-only>

      <v-dialog v-model="modifyDialog" width="800">
        <client-only>
          <v-data-table
            :headers="dialogHeaders"
            :items="users"
            class="elevation-1"
            item-key="uid"
            :page.sync="dialogPage"
            :options.sync="dialogOptions"
            :server-items-length="dialogAllrow"
            :footer-props="{
              itemsPerPageText: '表示件数',
              itemsPerPageOptions: [10, 50, 100, -1],
            }"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>{{ dialogItem.name }}</v-toolbar-title>
                <v-btn
                  v-if="dialogItem.uid !== '0000'"
                  class="ml-6"
                  x-small
                  color="error"
                  @click="modifyUid({ name: '未登録者', uid: '0000' })"
                  >未登録者に変更する</v-btn
                >
              </v-toolbar>
              <v-form>
                <v-container>
                  <div class="d-flex">
                    <div class="flex-grow-1 flex-shrink-0">
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model="dialogConditions.name"
                            label="登録者名"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="6">
                          <v-text-field
                            v-model="dialogConditions.item1"
                            label="個別ID"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="dialogConditions.sex"
                            :items="sexoptions"
                            item-text="label"
                            item-value="value"
                            label="性別"
                            outlined
                          ></v-select>
                        </v-col>

                        <v-col cols="6">
                          <v-select
                            v-model="dialogConditions.state"
                            :items="categoryoptions"
                            item-text="name"
                            item-value="code"
                            label="登録種別"
                            outlined
                          ></v-select>
                        </v-col>
                      </v-row>
                    </div>
                    <div class="pa-3">
                      <v-img
                        v-if="dialogItem.photo"
                        width="100"
                        class="ma-2"
                        :src="'/' + dialogItem.photo"
                      />
                    </div>
                  </div>
                  <div class="d-flex">
                    <v-spacer></v-spacer>
                    <v-btn
                      color="grey"
                      class="white--text ma-2"
                      min-width="100"
                      @click="dialogClearConditions"
                      >クリア</v-btn
                    >
                    <v-btn
                      color="secondary"
                      class="ma-2"
                      min-width="100"
                      :loading="dialogSearching"
                      :disabled="dialogSearching"
                      @click="dialogSearch"
                      >検索</v-btn
                    >
                  </div>
                </v-container>
              </v-form>
            </template>
            <template v-slot:[`item.photo`]="{ item }">
              <v-img
                v-if="item.photo"
                width="100"
                class="ma-2"
                :src="'/' + item.photo"
              />
            </template>
            <template v-slot:[`item.sex`]="{ item }">
              {{ item.sex | formatSex }}
            </template>
            <template v-slot:[`item.created_at`]="{ item }">
              {{ item.created_at | formatDate }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="secondary"
                class="ma-2"
                min-width="80"
                small
                @click="modifyUid(item)"
                >再関連</v-btn
              >
            </template>
            <template v-slot:no-data>
              <span>該当データが存在しません</span>
            </template>
          </v-data-table>
        </client-only>
      </v-dialog>
      <confirmDialog
        ref="dlgConfirmModifyUid"
        :message="`このレコードを「${reLinkingItem.name}」に変更しても\nよろしでしょうか？`"
        @confirm="onConfirmModifyUid"
      ></confirmDialog>
      <v-dialog v-model="updatePhotoDialog" persistent width="600">
        <v-card class="d-flex flex-column text-center" min-height="358">
          <v-card-title></v-card-title>
          <v-spacer></v-spacer>
          <v-card-text>
            <div class="d-flex" text-center>
              <v-img
                v-if="reLinkingItem.photo"
                width="100"
                class="ma-2"
                :src="'/' + reLinkingItem.photo"
              />
              <v-icon color="error" size="80">fa-long-arrow-alt-right</v-icon>
              <v-img
                v-if="dialogItem.photo"
                width="100"
                class="ma-2"
                :src="'/' + dialogItem.photo"
              />
            </div>
            <div class="pt-4 text-h6" style="white-space: break-spaces;">
              新しい写真に変更しますか？
              <slot></slot>
            </div>
          </v-card-text>
          <v-spacer></v-spacer>
          <v-card-actions class="pb-12">
            <v-spacer></v-spacer>
            <v-btn
              dark
              color="grey lighten-1"
              min-width="100px"
              @click="onCancelUpdatePhotoDialog"
              >取消</v-btn
            >
            <v-btn
              color="error"
              min-width="100px"
              @click="onConfirmUpdatePhotoDialog"
              >実行する</v-btn
            >
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import moment from 'moment'
import confirmDialog from '@/components/confirm-dialog'

export default {
  layout: 'admin',
  components: {
    confirmDialog,
  },
  async asyncData({ $axios, params }) {
    const devicesRes = await $axios
      .get('/activestreamhc/devices')
      .catch((err) => {
        console.log(err)
      })
    let data = []
    if (devicesRes) {
      data = devicesRes.data
    }
    const deviceoptions = [{ devicelabel: '全部', serialno: 'all' }, ...data]
    const res = await $axios.get('/activestreamhc/categories').catch((err) => {
      console.log(err)
    })
    let categories = []
    if (res) {
      categories = res.data
    }
    const categoryoptions = [{ name: '全部', code: 'all' }, ...categories]
    const category = params.category || {}
    const user = params.user || {}
    const conditions = {
      fromDate: null,
      toDate: null,
      serialno: params.serialno || 'all',
      temperature: 'all',
      mask: 'all',
      sex: 'all',
      state: category.code || 'all',
      useruid: user.uid,
    }
    return {
      deviceoptions,
      categoryoptions,
      conditions,
      user,
    }
  },
  data() {
    return {
      deviceoptions: [],
      temperatureoptions: [
        { label: '全部', value: 'all' },
        { label: '正常', value: 'normal' },
        { label: '高温', value: 'high' },
      ],
      maskoptions: [
        { label: '全部', value: 'all' },
        { label: 'あり', value: 'あり' },
        { label: 'なし', value: 'なし' },
      ],
      sexoptions: [
        { label: '全部', value: 'all' },
        { label: '男', value: 'Male' },
        { label: '女', value: 'Female' },
      ],
      headers: [
        { text: '', value: 'photo', sortable: false },
        {
          text: '登録者名',
          align: 'center',
          value: 'name',
          sortable: false,
        },
        {
          text: 'デバイス',
          align: 'center',
          value: 'serialno',
          sortable: false,
        },
        { text: '性別', align: 'center', value: 'sex', sortable: false },
        { text: 'マスク', align: 'center', value: 'ismask', sortable: false },
        {
          text: '体温',
          align: 'center',
          value: 'temperature',
          sortable: false,
        },
        {
          text: '登録種別',
          align: 'center',
          value: 'statelabel',
          sortable: false,
        },
        {
          text: '登録日',
          align: 'center',
          value: 'created_at',
          sortable: false,
        },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      startMenu: false,
      endMenu: false,
      options: {},
      page: 1,
      logs: [],
      allrow: 0,
      csvFilePath: '',
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
      exporting: false,
      searching: false,
      toggle_exclusive: 0,
      modifyDialog: false,
      dialogSearching: false,
      dialogHeaders: [
        { text: '', value: 'photo', sortable: false },
        {
          text: '個別ID',
          align: 'center',
          value: 'item1',
        },
        { text: '登録者名', align: 'center', value: 'name' },
        { text: '性別', align: 'center', value: 'sex', sortable: false },
        {
          text: '登録種別',
          align: 'center',
          value: 'statelabel',
          sortable: false,
        },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      users: [],
      dialogConditions: {
        name: null,
        item1: null,
        sex: 'all',
        state: 'all',
      },
      dialogOptions: {},
      dialogPage: 1,
      dialogAllrow: 0,
      dialogItem: {},
      reLinkingItem: {},
      updatePhotoDialog: false,
    }
  },
  watch: {
    options: {
      async handler() {
        await this.getLoglist()
      },
      deep: true,
    },
    dialogOptions: {
      async handler() {
        await this.loadData()
      },
      deep: true,
    },
    toggle_exclusive: {
      handler(val, oldVal) {
        switch (val) {
          case 0:
            this.conditions.fromDate = null
            this.conditions.toDate = null
            break
          case 1:
            this.conditions.fromDate = moment()
              .add('-1', 'days')
              .format('YYYY-MM-DD')
            this.conditions.toDate = moment()
              .add('-1', 'days')
              .format('YYYY-MM-DD')
            break
          case 2:
            this.conditions.fromDate = moment().format('YYYY-MM-DD')
            this.conditions.toDate = moment().format('YYYY-MM-DD')
            break
          case 3:
            this.conditions.fromDate = moment()
              .startOf('month')
              .format('YYYY-MM-DD')
            this.conditions.toDate = moment()
              .endOf('month')
              .format('YYYY-MM-DD')
            break

          default:
            break
        }
      },
    },
  },
  computed: {
    showUser() {
      return this.user && this.user.name
    },
  },
  methods: {
    moveToAdd(item) {
      this.$router.push({
        name: `admin-user-add`,
        params: {
          newMember: item,
        },
      })
    },

    moveToDetail(uid) {
      this.$router.push(`/admin/user/${uid}`)
    },

    async getLoglist() {
      this.searching = true
      const { page, itemsPerPage } = this.options
      const res = await this.$axios
        .post('/activestreamhc/loglist', {
          ...this.conditions,
          page,
          rows: itemsPerPage,
        })
        .catch((err) => {
          console.log(err)
        })
      this.searching = false
      this.snackbarMessage = '検索を実行しました。'
      this.snackbarColor = 'success'
      this.snackbar = true
      this.allrow = res.data[0][0].allrow
      this.logs = res.data[1]
    },

    async search() {
      if (this.page === 1) {
        await this.getLoglist()
      } else {
        this.page = 1
      }
    },
    clearConditions() {
      this.toggle_exclusive = 0
      this.conditions = {
        fromDate: null,
        toDate: null,
        serialno: 'all',
        temperature: 'all',
        mask: 'all',
        sex: 'all',
        state: 'all',
        useruid: null,
      }
      // this.logs = []
    },
    downloadFile(url) {
      if (url === '') return
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.download = url
      a.href = url
      a.click()
      a.remove()
    },
    async exportcsv() {
      this.exporting = true
      const res = await this.$axios
        .post('/activestreamhc/logcsv', {
          ...this.conditions,
          page: 1,
          rows: -1,
        })
        .catch((err) => {
          console.log(err)
        })
      this.exporting = false
      if (res.data.filePath) {
        this.csvFilePath = `/${res.data.filePath}`
        this.snackbarMessage = 'CSVファイルをエクスポートしました。'
        this.snackbarColor = 'success'
        this.downloadFile(this.csvFilePath)
      } else {
        this.snackbarMessage = '該当データが存在しません。'
        this.snackbarColor = 'warning'
      }
      this.snackbar = true
    },
    openModifyDialog(item) {
      this.modifyDialog = true
      this.dialogItem = item
    },
    async loadData() {
      this.dialogSearching = true
      const { page, itemsPerPage, sortBy, sortDesc } = this.dialogOptions
      const { data } = await this.$axios
        .post('/activestreamhc/userlist', {
          ...this.dialogConditions,
          page,
          rows: itemsPerPage,
          sortBy,
          sortDesc,
        })
        .catch((err) => {
          console.log(err)
        })
      this.dialogSearching = false
      this.users = data[1]
      this.dialogAllrow = data[0][0].allrow
    },
    dialogClearConditions() {
      this.dialogConditions = {
        name: null,
        item1: null,
        sex: 'all',
        state: 'all',
      }
    },
    async dialogSearch() {
      if (this.page === 1) {
        await this.loadData()
      } else {
        this.page = 1
      }
    },
    modifyUid(item) {
      this.$refs.dlgConfirmModifyUid.isDisplay = true
      this.reLinkingItem = item
    },
    async closeModifyUidDialog() {
      this.modifyDialog = false
      this.dialogItem = {}
      this.reLinkingItem = {}
      await this.search()
    },
    async onConfirmModifyUid() {
      await this.updateLogById(this.reLinkingItem.uid)
      if (this.reLinkingItem.uid !== '0000') {
        this.updatePhotoDialog = true
        return
      }
      await this.closeModifyUidDialog()
    },
    async onCancelUpdatePhotoDialog() {
      this.updatePhotoDialog = false
      await this.closeModifyUidDialog()
    },
    async onConfirmUpdatePhotoDialog() {
      await this.$axios.put('/activestreamhc/userupdatephoto', {
        item: this.dialogItem,
        uid: this.reLinkingItem.uid,
      })
      this.updatePhotoDialog = false
      await this.closeModifyUidDialog()
    },
    async updateLogById(uid) {
      await this.$axios.put('/activestreamhc/logs/modify-uid', {
        item: this.dialogItem,
        uid,
      })
    },
  },
}
</script>
