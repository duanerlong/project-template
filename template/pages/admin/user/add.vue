<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <user-detail
        v-if="type !== 'csv'"
        :file.sync="file"
        :member="newMember"
        @save="onSave"
        @back="onBack"
      />
      <div v-else-if="type === 'csv'">
        <v-card class="mb-12 pb-5" min-height="170">
          <v-card-title class="text-h6">
            CSV読み込み
          </v-card-title>
          <v-card-text class="py-3">
            <v-file-input
              v-model="files"
              accept=".csv"
              show-size
              label="顔写真とCSVファイルがあるフォルダを選択してください。"
              webkitdirectory
              directory
              multiple
            ></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" min-width="80" @click="onDownloadSample"
              >サンプルデータをダウンロードする</v-btn
            >
            <v-spacer />
            <v-btn
              color="grey"
              min-width="80"
              class="white--text"
              @click="onBack"
              >戻る</v-btn
            >
            <v-btn color="secondary" min-width="80" @click="onCsvPicked"
              >読み込み</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card v-if="newMembers.length > 0" class="pb-5" min-height="170">
          <v-card-title class="text-h6">
            CSV読み込みプレビュー
            <v-spacer />

            <v-form ref="form">
              <v-select
                v-model="state"
                :rules="stateRules"
                :items="categoryoptions"
                item-text="name"
                item-value="code"
                label="登録種別"
              ></v-select>
            </v-form>
          </v-card-title>
          <v-card-text class="py-3">
            <v-data-table
              :headers="headers"
              :items="newMembers"
              class="elevation-0"
              :footer-props="{
                itemsPerPageText: '表示件数',
                itemsPerPageOptions: [10, 50, 100, -1],
              }"
            >
              <template v-slot:[`header.photo`]="{ header }">
                {{ header.text
                }}<span class="red--text" style="font-size: 10px;">（＊）</span>
              </template>
              <template v-slot:[`header.item1`]="{ header }">
                {{ header.text
                }}<span class="red--text" style="font-size: 10px;">（＊）</span>
              </template>
              <template v-slot:[`header.name`]="{ header }">
                {{ header.text
                }}<span class="red--text" style="font-size: 10px;">（＊）</span>
              </template>
              <template v-slot:[`header.sex`]="{ header }">
                {{ header.text
                }}<span class="red--text" style="font-size: 10px;">（＊）</span>
              </template>
              <template v-slot:[`item.photo`]="{ item }">
                <v-img width="100" class="ma-2" :src="item.photoTmp" />
              </template>
              <template v-slot:[`item.birthday`]="{ item }">
                {{ item.birthday }}
              </template>
              <template v-slot:no-data>
                <span>該当データが存在しません</span>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="secondary" min-width="80" @click="onSaveAll"
              >一括登録</v-btn
            >
          </v-card-actions>
        </v-card>
        <confirmDialog
          ref="dlg"
          color="success"
          icon="fas fa-upload"
          :message="confirmMessage"
          @confirm="onConfirm"
        ></confirmDialog>

        <v-dialog v-model="insertDialog" persistent width="600px">
          <v-card class="d-flex flex-column text-center" min-height="358">
            <v-card-title></v-card-title>
            <v-spacer></v-spacer>
            <v-card-text>
              <div class="d-flex justify-center">
                <div text-center class="mx-12 mt-6">
                  <v-icon class="ma-3" color="success" size="80"
                    >far fa-check-circle</v-icon
                  >
                  <div class="text-h4">
                    成功
                  </div>
                  <div class="text-h4">{{ successCount }}件</div>
                </div>
                <div text-center class="mx-12 mt-6">
                  <v-icon class="ma-3" color="error" size="80"
                    >far fa-times-circle</v-icon
                  >
                  <div class="text-h4">
                    却下
                  </div>
                  <div class="text-h4">{{ rejectedCount }}件</div>
                </div>
              </div>
              <div class="pt-4 red--text" style="white-space: break-spaces;">
                {{ insertDialogMessage }}
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
                @click="
                  insertDialog = false
                  onBack()
                "
                >顔登録一覧へ戻る</v-btn
              >
              <v-btn
                color="error"
                min-width="100px"
                :disabled="rejectedCount === 0"
                @click="onDownload"
                >登録失敗データをダウンロードする</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import FormData from 'form-data'
import moment from 'moment'
import confirmDialog from '@/components/confirm-dialog'

export default {
  components: {
    confirmDialog,
  },
  layout: 'admin',
  async asyncData({ $axios, params }) {
    const newMember = params.newMember || {}
    const categoryRes =
      (await $axios.get('/activestreamhc/categories').catch((err) => {
        console.log(err)
      })) || {}
    const categoryoptions = categoryRes.data || []
    return {
      type: params.type,
      newMember,
      categoryoptions,
    }
  },
  data() {
    return {
      uploadCsvUrl: '',
      files: null,
      file: null,
      sexoptions: [
        { label: '男', value: 'Male' },
        { label: '女', value: 'Female' },
      ],
      headers: [
        { text: '顔写真', align: 'start', value: 'photo', sortable: false },
        {
          text: '個別ID',
          align: 'start',
          value: 'item1',
          sortable: false,
        },
        { text: '登録者名', align: 'center', value: 'name', sortable: false },
        { text: '性別', align: 'center', value: 'sex', sortable: false },
        {
          text: '生年月日（西暦）',
          align: 'center',
          value: 'birthday',
          sortable: false,
        },
        {
          text: '項目2',
          align: 'start',
          value: 'item2',
          sortable: false,
        },
        {
          text: '項目3',
          align: 'start',
          value: 'item3',
          sortable: false,
        },
        {
          text: '項目4',
          align: 'start',
          value: 'item4',
          sortable: false,
        },
        {
          text: '項目5',
          align: 'start',
          value: 'item5',
          sortable: false,
        },
        {
          text: '項目6',
          align: 'start',
          value: 'item6',
          sortable: false,
        },
        {
          text: '項目7',
          align: 'start',
          value: 'item7',
          sortable: false,
        },
        {
          text: '項目8',
          align: 'start',
          value: 'item8',
          sortable: false,
        },
        {
          text: '項目9',
          align: 'start',
          value: 'item9',
          sortable: false,
        },
        {
          text: '項目10',
          align: 'start',
          value: 'item10',
          sortable: false,
        },
      ],
      newMembers: [],
      images: {},
      state: null,
      stateRules: [(v) => !!v || '登録種別は必須です'],
      confirmMessage: '',
      insertDialog: false,
      insertDialogMessage:
        '顔写真ファイルが実在しないなどの原因による登録を却下される。\nデータをもう一回確認してから再登録してください。',
      filesMap: {},
      invalidMembers: [],
      successCount: 0,
      rejectedCount: 0,
    }
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async onSave() {
      const formData = new FormData()
      if (this.file) {
        formData.append('file', this.file, this.file.name)
      }
      // additional data
      formData.append('member', JSON.stringify(this.newMember))
      const { data } = await this.$axios
        .post(`/activestreamhc/useradd`, formData)
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        this.onBack()
      }
    },
    onDownload() {
      let rows = [
        [
          '個別ID',
          '登録者名',
          '性別(男/女)',
          '顔写真',
          '生年月日（西暦）',
          '項目2',
          '項目3',
          '項目4',
          '項目5',
          '項目6',
          '項目7',
          '項目8',
          '項目9',
          '項目10',
        ],
      ]
      rows = rows.concat(
        this.invalidMembers.map((item) => [
          item.item1,
          item.name,
          item.sex,
          item.photo,
          item.birthday,
          item.item2,
          item.item3,
          item.item4,
          item.item5,
          item.item6,
          item.item7,
          item.item8,
          item.item9,
          item.item10,
        ])
      )

      const data = rows.map((e) => e.join(',')).join('\n')

      const bom = new Uint8Array([239, 187, 191])
      const blob = new Blob([bom, data], { type: 'text/csv' })
      const url = (window.URL || window.webkitURL).createObjectURL(blob)

      const a = document.createElement('a')
      document.body.appendChild(a)
      a.download = '却下データ.csv'
      a.href = url
      a.click()
      a.remove()

      this.insertDialog = false
      this.onBack()
    },
    onSaveAll() {
      this.filesMap = {}
      this.invalidMembers = []
      if (!this.$refs.form.validate()) {
        return
      }
      this.filesMap = this.newMembers.reduce((pre, current) => {
        if (!pre[current.photo]) {
          pre[current.photo] = []
        }
        pre[current.photo].push(current)
        return pre
      }, this.filesMap)
      Object.keys(this.filesMap).forEach((key) => {
        if (this.filesMap[key].length > 1) {
          this.invalidMembers = this.invalidMembers.concat(this.filesMap[key])
          delete this.filesMap[key]
        } else {
          const val = this.filesMap[key][0]

          if (
            !val.item1 ||
            !val.name ||
            !val.sex ||
            !val.photo ||
            this.files.filter((file) => file.name === val.photo).length === 0
          ) {
            this.invalidMembers.push(val)
            delete this.filesMap[key]
          }
        }
      })
      const insertCount = Object.keys(this.filesMap).length
      if (insertCount === 0 && this.invalidMembers.length > 0) {
        this.insertDialog = true
        this.successCount = 0
        this.rejectedCount = this.invalidMembers.length

        return
      }
      this.$refs.dlg.isDisplay = true

      this.confirmMessage = `${insertCount}件CSVデータを一括登録\n${
        this.categoryoptions.filter((item) => item.code === this.state)[0].name
      }`
    },
    async onConfirm() {
      const formData = new FormData()
      if (this.files) {
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i]
          if (
            new RegExp('.jpg$').test(file.name.toLowerCase()) &&
            new RegExp('^(?![.])').test(file.name.toLowerCase()) &&
            this.filesMap[file.name]
          ) {
            formData.append('files', file)
          }
        }
      }
      formData.append('state', this.state)
      const insertMembers = []
      Object.keys(this.filesMap).forEach((key) => {
        const item = this.filesMap[key][0]
        insertMembers.push([
          item.item1,
          item.name,
          item.sex,
          item.photo,
          item.birthday,
          item.item2,
          item.item3,
          item.item4,
          item.item5,
          item.item6,
          item.item7,
          item.item8,
          item.item9,
          item.item10,
        ])
      })
      console.log(insertMembers)
      formData.append('members', JSON.stringify(insertMembers))
      const { data } = await this.$axios
        .post(`/activestreamhc/useradd/batch`, formData)
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        this.insertDialog = true
        this.successCount = insertMembers.length
        this.rejectedCount = this.invalidMembers.length
      }
    },
    onDownloadSample() {
      const rows = [
        [
          '個別ID',
          '登録者名',
          '性別(男/女)',
          '顔写真',
          '生年月日（西暦）',
          '項目2',
          '項目3',
          '項目4',
          '項目5',
          '項目6',
          '項目7',
          '項目8',
          '項目9',
          '項目10',
        ],
        ['999999999', 'アゼスト太郎', '男', 'user1.jpg', '1990-01-01'],
        ['999999998', 'アゼスト次郎', '女', 'user2.jpg', '2000-01-01'],
      ]

      const data = rows.map((e) => e.join(',')).join('\n')

      const bom = new Uint8Array([239, 187, 191])
      const blob = new Blob([bom, data], { type: 'text/csv' })
      const url = (window.URL || window.webkitURL).createObjectURL(blob)

      const a = document.createElement('a')
      document.body.appendChild(a)
      a.download = 'sample.csv'
      a.href = url
      a.click()
      a.remove()
    },
    async onCsvPicked() {
      this.newMembers = []
      if (this.files !== undefined && this.files !== null) {
        const csvFiles = this.files.filter(
          (file) =>
            new RegExp('.csv$').test(file.name.toLowerCase()) &&
            new RegExp('^(?![.])').test(file.name.toLowerCase())
        )
        const imgFiles = this.files.filter(
          (file) =>
            new RegExp('.jpg$').test(file.name.toLowerCase()) &&
            new RegExp('^(?![.])').test(file.name.toLowerCase())
        )
        for (let index = 0; index < imgFiles.length; index++) {
          const file = imgFiles[index]
          if (file.name.lastIndexOf('.') <= 0) {
            continue
          }
          this.images[file.name] = await this.loadImage(file)
        }
        for (let index = 0; index < csvFiles.length; index++) {
          const file = csvFiles[index]
          if (file.name.lastIndexOf('.') <= 0) {
            continue
          }
          this.newMembers = [...this.newMembers, ...(await this.loadCsv(file))]
        }
        this.newMembers.map((item) => {
          item.photoTmp = this.images[item.photo]
          return item
        })
      }
    },
    loadCsv(file) {
      const recordTemplate = [
        'item1',
        'name',
        'sex',
        'photo',
        'birthday',
        'item2',
        'item3',
        'item4',
        'item5',
        'item6',
        'item7',
        'item8',
        'item9',
        'item10',
      ]
      return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.addEventListener('load', () => {
          const lines = fr.result.split('\n').slice(1)
          resolve(
            lines
              .map((item) => {
                const fields = item.replace('\r', '').split(',')
                fields.length = recordTemplate.length
                const record = {}
                recordTemplate.forEach((value, index) => {
                  record[value] = fields[index]
                })
                const birthdayStr = (record.birthday || '').replace(/\//g, '-')
                if (moment(birthdayStr).isValid()) {
                  record.birthday = birthdayStr
                } else {
                  delete record.birthday
                }
                return record
              })
              .filter(
                (record) =>
                  record.item1 || record.name || record.sex || record.photo
              )
          )
        })
        fr.readAsText(file)
      })
    },
    loadImage(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.addEventListener('load', () => {
          resolve(fr.result)
        })
        fr.readAsDataURL(file)
      })
    },
  },
}
</script>
