<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="users"
          class="elevation-1"
          v-model="selected"
          item-key="uid"
          show-select
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
              <v-toolbar-title>顔登録者一覧</v-toolbar-title>
              <v-btn color="secondary" class="ma-2" @click="moveToAdd()"
                >新規登録</v-btn
              >
              <v-btn color="secondary" class="ma-2" @click="moveToAdd('csv')"
                >一括登録</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn
                color="yellow"
                class="ma-2"
                min-width="80"
                :disabled="selected.length == 0"
                @click="selectReportAttendanceDate()"
                >月次一覧一括出力</v-btn
              >
              <v-btn
                color="secondary"
                min-width="148"
                class="ma-2"
                @click="moveToSettings"
                >カスタマイズカラム設定</v-btn
              >
              <v-btn
                color="secondary"
                min-width="148"
                class="ma-2"
                @click.stop="onSyncUser"
                >全デバイスデータ同期</v-btn
              >
            </v-toolbar>
            <v-form>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model="conditions.name"
                      label="登録者名"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model="conditions.item1"
                      label="個別ID"
                    ></v-text-field>
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

                  <!-- 
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
                  -->
                </v-row>
                <div class="d-flex">
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
              color="orange white--text"
              class="ma-2"
              min-width="80"
              small
              @click="selectReportAttendanceDate(item.uid)"
              >月次一覧</v-btn
            >
            <v-btn
              color="secondary"
              class="ma-2"
              min-width="80"
              small
              @click="moveToDetail(item.uid)"
              >情報詳細</v-btn
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
              color="accent"
              class="ma-2"
              min-width="80"
              small
              @click.stop="setMessage(item.uid)"
              >伝言</v-btn
            >
          </template>
          <template v-slot:no-data>
            <span>該当データが存在しません</span>
          </template>
          <template v-slot:footer>
            <div style="position: relative;">
              <div style="position: absolute; bottom: -55px;">
                <v-btn
                  color="error"
                  class="ma-2"
                  :disabled="selected.length == 0"
                  :loading="processing"
                  @click="onDelete()"
                  >一括削除</v-btn
                >
              </div>
            </div>
          </template>
        </v-data-table>
      </client-only>
      <message-dialog
        v-if="dialog"
        :is-display.sync="dialog"
        :edit-uid="editUid"
        @close="onClose"
        @save="onSave"
      />

      <v-dialog v-model="syncDialog" persistent width="563">
        <v-card class="d-flex flex-column" height="358">
          <v-card-title></v-card-title>
          <v-spacer />
          <v-icon x-large class="mb-3">far fa-hourglass</v-icon>
          <v-card-text class="text-h6 text-center py-3">
            全デバイスに同期しています。
          </v-card-text>
          <v-card-actions class="mb-12">
            <v-spacer />
            <div class="d-flex flex-column">
              <v-btn color="primary" class="my-3" to="/admin/orderlist"
                >指令一覧へ</v-btn
              >
              <v-btn color="secondary" class="my-3" @click="syncDialog = false"
                >一覧に戻る</v-btn
              >
            </div>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="reportDialog" width="400"
        ><v-card>
          <v-card-title>月次を選択してください。</v-card-title>
          <v-card-text class="text-h6 text-center py-3">
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label="月次"
                  prepend-icon="far fa-calendar-alt"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                type="month"
                no-title
                scrollable
                locale="ja"
                @input="menu = false"
              >
              </v-date-picker>
            </v-menu>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="secondary"
              class="my-3"
              @click="openReportAttendance()"
              >出力</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <confirmDialog ref="dlg" @confirm="onConfirm"></confirmDialog>
    </v-col>
  </v-row>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import messageDialog from '@/components/message-dialog'
import confirmDialog from '@/components/confirm-dialog'

export default {
  layout: 'admin',
  components: {
    messageDialog,
    confirmDialog,
  },
  async asyncData({ $axios, params }) {
    const category = params.category || {}
    const res = await $axios.get('/activestreamhc/categories').catch((err) => {
      console.log(err)
    })
    let categories = []
    if (res) {
      categories = res.data
    }
    const categoryoptions = [{ name: '全部', code: 'all' }, ...categories]
    const conditions = {
      fromDate: null,
      toDate: null,
      name: null,
      item1: null,
      sex: 'all',
      state: category.code || 'all',
    }
    return {
      users: [],
      category,
      categoryoptions,
      conditions,
    }
  },
  data() {
    return {
      dialog: false,
      syncDialog: false,
      reportDialog: false,
      processing: false,
      menu: false,
      date: moment().format('YYYY-MM'),
      selected: [],
      headers: [
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
        { text: '登録日', align: 'center', value: 'created_at' },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      editUid: '',
      reportData: null,
      options: {},
      page: 1,
      allrow: 0,
      startMenu: false,
      endMenu: false,
      searching: false,
      sexoptions: [
        { label: '全部', value: 'all' },
        { label: '男', value: 'Male' },
        { label: '女', value: 'Female' },
      ],
    }
  },

  watch: {
    options: {
      async handler() {
        await this.loadData()
      },
      deep: true,
    },
  },

  computed: {
    ...mapGetters({
      devices: 'devices/devices',
    }),
    showCategory() {
      return this.category && this.category.name
    },
  },

  async created() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      this.searching = true
      const { page, itemsPerPage, sortBy, sortDesc } = this.options
      const { data } = await this.$axios
        .post('/activestreamhc/userlist', {
          state: this.category.code || 'all',
          ...this.conditions,
          page,
          rows: itemsPerPage,
          sortBy,
          sortDesc,
        })
        .catch((err) => {
          console.log(err)
        })
      this.searching = false
      this.users = data[1]
      this.allrow = data[0][0].allrow
    },
    async onSyncUser() {
      this.syncDialog = true
      await this.$axios.post(`/activestreamhc/synuser`).catch((err) => {
        console.log(err)
      })
    },
    moveToDetail(uid) {
      this.$router.push(`/admin/user/${uid}`)
    },

    moveToSettings() {
      this.$router.push(`/admin/user/settings`)
    },

    moveToLog(user) {
      this.$router.push({
        name: 'admin-log',
        params: {
          user,
        },
      })
    },

    moveToAdd(type) {
      this.$router.push({
        name: `admin-user-add`,
        params: {
          type,
        },
      })
    },

    setMessage(uid) {
      this.dialog = true
      this.editUid = uid
    },

    onClose() {
      this.editUid = ''
    },

    async onSave(data) {
      data.user_uid = this.editUid
      await this.$axios.post(`/activestreamhc/message`, data).catch((err) => {
        console.log(err)
      })
    },

    selectReportAttendanceDate(uid) {
      this.reportDialog = true
      let users = this.selected.map((item) => item.uid)
      if (uid) {
        users = [uid]
      }
      this.reportData = {
        users,
      }
    },

    async openReportAttendance() {
      if (!this.reportData) return
      const res = await this.$axios
        .post(`/activestreamhc/report`, {
          params: { ...this.reportData, date: `${this.date}-01` },
        })
        .catch((err) => {
          console.log(err)
        })
      this.reportDialog = false
      this.date = moment().format('YYYY-MM')
      this.reportData = null
      if (res && res.data) {
        const reportUid = res.data.uid
        const routeData = this.$router.resolve({
          name: 'admin-report-attendance',
          query: { uid: reportUid },
        })
        window.open(routeData.href, '_blank')
      }
    },
    onDelete() {
      this.$refs.dlg.isDisplay = true
    },
    async onConfirm() {
      this.processing = true
      const users = this.selected.map((item) => item.uid)
      const res = await this.$axios
        .post(`/activestreamhc/userbatchdelete`, {
          uidList: users,
        })
        .catch((err) => {
          console.log(err)
          this.processing = false
        })
      this.processing = false
      if (res && res.data && res.data.result) {
        await this.loadData()
      }
    },

    clearConditions() {
      this.conditions = {
        fromDate: null,
        toDate: null,
        name: null,
        item1: null,
        sex: 'all',
        state: 'all',
      }
    },
    async search() {
      if (this.page === 1) {
        await this.loadData()
      } else {
        this.page = 1
      }
    },
  },
}
</script>
