<template>
  <v-card min-height="490" class="pb-5">
    <v-card-title class="text-h6">
      {{ title }}
      <v-spacer />
      <v-btn
        v-if="!isNew"
        color="yellow"
        class="ma-2"
        min-width="80"
        @click="selectReportAttendanceDate(member.uid)"
        >月次一覧出力</v-btn
      >
    </v-card-title>
    <v-card-text class="py-3">
      <v-form ref="form">
        <v-row>
          <v-col md="4">
            <v-card width="239" height="319" class="ma-auto">
              <v-img v-if="photo" width="239" height="319" :src="photo" />
            </v-card>
            <v-file-input
              v-model="fileTmp"
              accept="image/jpeg"
              show-size
              label="顔写真"
              hint="(※60KB以内jpg写真)"
              persistent-hint
              class="file-upload"
              @change="onImagePicked"
            ></v-file-input>
          </v-col>
          <v-col v-if="member">
            <v-text-field
              v-model="member.name"
              :rules="nameRules"
              label="姓名"
              required
            ></v-text-field>
            <v-select
              v-model="member.sex"
              :rules="sexRules"
              :items="sexoptions"
              item-text="label"
              item-value="value"
              label="性別"
            ></v-select>

            <v-menu
              v-model="birthdayMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              min-width="290px"
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="member.birthday"
                  label="生年月日"
                  prepend-icon="far fa-calendar-alt"
                  dense
                  readonly
                  hide-details
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="birthday"
                no-title
                scrollable
                locale="ja"
                @input="birthdayMenu = false"
              >
              </v-date-picker>
            </v-menu>
            <v-select
              v-model="member.state"
              :rules="stateRules"
              :items="categoryoptions"
              item-text="name"
              item-value="code"
              label="登録種別"
            ></v-select>
            <v-text-field
              v-for="(value, key) in fields"
              :key="key"
              v-model="member[key]"
              :label="value.label || key"
              :rules="value.rules"
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn v-if="!isNew" color="error" min-width="80" @click="onDelete"
        >削除</v-btn
      >
      <v-spacer />
      <v-btn
        color="grey"
        class="white--text"
        min-width="80"
        small
        @click="onBack"
        >戻る</v-btn
      >
      <v-btn v-if="isNew" color="secondary" min-width="80" small @click="onSave"
        >登録</v-btn
      >
      <v-btn
        v-if="!isNew"
        color="secondary"
        min-width="80"
        small
        @click="onSave"
        >保存</v-btn
      >
      <confirmDialog ref="dlg" @confirm="onConfirm"></confirmDialog>

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
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.file-upload >>> .v-messages {
  text-align: right !important;
  color: black !important;
}
</style>

<script>
import moment from 'moment'
import confirmDialog from '@/components/confirm-dialog'

export default {
  components: {
    confirmDialog,
  },
  props: {
    member: {
      type: Object,
      default: () => {},
    },
    file: {
      required: false,
      default: null,
    },
  },
  data() {
    return {
      birthdayMenu: false,
      uploadImageUrl: '',
      sexoptions: [
        { label: '男', value: 'Male' },
        { label: '女', value: 'Female' },
      ],
      fields: {},
      categoryoptions: [],
      nameRules: [(v) => (v && v.length !== 0) || '姓名は必須です'],
      sexRules: [(v) => (v && v.length !== 0) || '性別は必須です'],
      stateRules: [(v) => !!v || '登録種別は必須です'],
      date: moment().format('YYYY-MM'),
      reportDialog: false,
      menu: false,
    }
  },
  computed: {
    photo() {
      const photoPath =
        this.uploadImageUrl ||
        (this.member.photo ? `/${this.member.photo}` : '')
      return photoPath
    },
    birthday: {
      get() {
        if (this.member.birthday === 'Unknown') return null
        return this.member.birthday
      },
      set(newValue) {
        this.member.birthday = newValue
      },
    },
    isNew() {
      return !this.member.uid || this.member.uid === '0000'
    },
    title() {
      return this.isNew ? '顔登録' : '情報詳細'
    },
    fileTmp: {
      get() {
        return this.file
      },
      set(value) {
        this.$emit('update:file', value)
      },
    },
  },
  async created() {
    const { data } = await this.$axios
      .get(`/activestreamhc/usersettings`)
      .catch((err) => {
        console.log(err)
      })
    const settings = data.settings
    this.fields = settings.reduce(
      (previousValue, currentValue, currentIndex, array) => {
        const label = currentValue.label
        const required = currentValue.required
        if (label || required) {
          const field = currentValue.field
          let rules = []
          if (required) {
            rules = [(v) => !!v || `${label}は必須です`]
          }
          previousValue[field] = {
            field,
            label,
            rules,
          }
        }
        return previousValue
      },
      {}
    )
    const categoryRes = await this.$axios
      .get('/activestreamhc/categories')
      .catch((err) => {
        console.log(err)
      })
    this.categoryoptions = categoryRes.data
  },
  methods: {
    onImagePicked(file) {
      if (file !== undefined && file !== null) {
        if (file.name.lastIndexOf('.') <= 0) {
          return
        }
        const fr = new FileReader()
        fr.readAsDataURL(file)
        fr.addEventListener('load', () => {
          this.uploadImageUrl = fr.result
        })
      } else {
        this.uploadImageUrl = ''
      }
    },
    onDelete() {
      this.$refs.dlg.isDisplay = true
    },
    onConfirm() {
      this.$emit('delete')
    },
    onSave() {
      if (this.$refs.form.validate()) {
        this.$emit('save')
      }
    },
    onBack() {
      this.$emit('back')
    },

    selectReportAttendanceDate(uid) {
      this.reportDialog = true
      this.reportData = {
        users: [uid],
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
  },
}
</script>
