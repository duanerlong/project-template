<template>
  <div>
    <v-card min-height="490">
      <v-card-title class="text-h6">
        アカウント詳細
      </v-card-title>
      <v-card-text class="py-3">
        <v-form ref="form">
          <v-row>
            <v-col>
              <v-text-field
                v-model="account.email"
                :rules="emailRules"
                label="Email"
                required
              ></v-text-field>

              <v-text-field
                v-model="account.password"
                type="password"
                :rules="passwordRules"
                label="パスワード"
                required
              ></v-text-field>

              <v-text-field
                v-model="account.name"
                :rules="nameRules"
                label="表示名"
                required
              ></v-text-field>
              <v-spacer />
            </v-col>
            <v-col md="4">
              <v-card width="239" height="319" class="ma-auto">
                <v-img v-if="photo" width="239" height="319" :src="photo" />
              </v-card>
              <v-file-input
                v-model="fileTmp"
                accept="image/*"
                show-size
                label="写真"
                hint="(※5MB以内jpg写真)"
                persistent-hint
                class="file-upload"
                @change="onImagePicked"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="pb-6">
        <v-spacer />
        <v-btn
          color="grey"
          class="white--text"
          min-width="80"
          small
          @click="onBack"
          >戻る</v-btn
        >
        <v-btn
          color="secondary"
          min-width="80"
          small
          :loading="infoSaving"
          :disabled="infoSaving"
          @click="onSaveInfo"
          >保存</v-btn
        >
      </v-card-actions>
    </v-card>
    <v-card class="mt-12">
      <v-card-title class="text-h6">
        権限設定
      </v-card-title>
      <v-card-text class="py-3">
        <v-form ref="form">
          <v-row justify="space-around">
            <v-radio-group v-model="typeTest" row>
              <v-radio
                v-for="(option, index) in typeOptions"
                :key="index"
                class="mx-8"
                :label="option.label"
                :value="option.value"
                @click="onSelected(option.value)"
              >
                <template v-slot:label>
                  <div @click="onSelected(option.value)">
                    {{ option.label }}
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="pb-6">
        <v-spacer />
        <v-btn
          color="grey"
          class="white--text"
          min-width="80"
          small
          @click="onBack"
          >戻る</v-btn
        >
        <v-btn
          color="secondary"
          min-width="80"
          small
          :loading="typeSaving"
          :disabled="typeSaving"
          @click="onSaveType"
          >保存</v-btn
        >
      </v-card-actions>
    </v-card>
    <confirmDialog
      ref="dlg"
      :color="dialogColor"
      :message="message"
      @confirm="onConfirm"
    ></confirmDialog>
  </div>
</template>

<style scoped>
.file-upload >>> .v-messages {
  text-align: right !important;
  color: black !important;
}
</style>

<script>
import confirmDialog from '@/components/confirm-dialog'
export default {
  components: {
    confirmDialog,
  },
  props: {
    account: {
      type: Object,
      default: () => {},
    },
    file: {
      required: false,
      default: null,
    },
    infoSaving: {
      type: Boolean,
      required: false,
      default: false,
    },
    typeSaving: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      typeOptions: [
        {
          label: '検温者',
          value: 0,
        },
        {
          label: '受付管理者',
          value: 3,
        },
        {
          label: '現場管理者',
          value: 2,
        },
        {
          label: '総合管理者（最高権限）',
          value: 1,
        },
      ],
      typeTmp: undefined,
      dialogColor: '',
      message: '',
      uploadImageUrl: '',
      emailRules: [(v) => v.length !== 0 || 'Emailは必須です'],
      passwordRules: [(v) => v.length !== 0 || 'パスワードは必須です'],
      nameRules: [(v) => !!v || '表示名は必須です'],
    }
  },
  computed: {
    photo() {
      const photoPath =
        this.uploadImageUrl ||
        (this.account.photo ? `/${this.account.photo}` : '')
      return photoPath
    },
    typeTest: {
      get() {
        return this.account.type
      },
      set(val) {
        const type = this.account.type
        this.account.type = null
        this.$nextTick(() => {
          this.account.type = type
          if (val === type && val !== 1) {
            this.$emit('typeChange')
          }
        })
        this.typeTmp = val
        if (val !== type) {
          switch (val) {
            case 0:
            case 3:
              this.dialogColor = 'success'
              this.message = 'リモート表示権限を付与しても\nよろしいでしょうか?'
              break
            case 1:
              this.dialogColor = 'primary'
              this.message = '総合管理者権限を付与しても\nよろしいでしょうか？'
              break
            case 2:
              this.dialogColor = 'secondary'
              this.message = '現場管理者権限を付与しても\nよろしいでしょうか?'
              break
          }
          this.$refs.dlg.isDisplay = true
        }
      },
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
  methods: {
    onSelected(val) {
      this.typeTest = val
    },
    onConfirm() {
      this.account.type = this.typeTmp
      if (this.typeTmp === 1) {
        this.account.devices = []
      } else {
        this.$emit('typeChange')
      }
    },
    onBack() {
      this.$emit('back')
    },
    onSaveInfo() {
      if (this.$refs.form.validate()) {
        this.$emit('saveInfo')
      }
    },
    onSaveType() {
      this.$emit('saveType')
    },
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
  },
}
</script>
