<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card class="pb-5">
      <v-card-title>
        <span class="headline">会員へ伝言する</span>
        <v-spacer />
        <v-btn color="primary" min-width="80" @click.stop="onShowHistory()">
          伝言履歴
        </v-btn>
        <v-dialog v-model="dialog1">
          <client-only>
            <v-data-table
              :headers="headers"
              :items="userMessages"
              class="elevation-1"
              :footer-props="{
                itemsPerPageText: '表示件数',
                itemsPerPageOptions: [10, 50, 100, -1],
              }"
            >
              <template v-slot:[`item.serialno`]="{ item }">
                <span>{{ item.devicelabel || item.serialno }}</span>
              </template>
              <template v-slot:[`item.type`]="{ item }">
                {{ item.type | formatType }}
              </template>
              <template v-slot:[`item.created_at`]="{ item }">
                {{ item.created_at | formatDate }}
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  color="error"
                  class="ma-2"
                  min-width="80"
                  small
                  @click="onDeleteMessage(item)"
                  >削除</v-btn
                >
              </template>
              <template v-slot:no-data>
                <span>該当データが存在しません</span>
              </template>
            </v-data-table>
          </client-only>
        </v-dialog>

        <confirmDialog ref="dlg" @confirm="confirmDeletion"></confirmDialog>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-container>
            <v-select
              v-model="selectedDevices"
              :rules="devicesRules"
              :items="devices"
              :loading="loading"
              :disabled="loading"
              item-text="devicelabel"
              item-value="serialno"
              label="デバイス"
              attach
              chips
              multiple
            ></v-select>
            <v-select
              v-model="destinations"
              :rules="destinationsRules"
              :items="destinationoptions"
              item-text="label"
              item-value="value"
              label="送信先"
              attach
              chips
              multiple
            ></v-select>
            <v-textarea
              v-model="message"
              :rules="messageRules"
              label="お知らせメッセージ"
              no-resize
            ></v-textarea>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" class="white--text" min-width="80" @click="onClose"
          >戻る</v-btn
        >
        <v-btn color="secondary" min-width="80" @click="onSave">伝言する</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import confirmDialog from '@/components/confirm-dialog'
export default {
  components: {
    confirmDialog,
  },
  props: {
    isDisplay: {
      type: Boolean,
      required: true,
      default: false,
    },
    editUid: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {
      destinationoptions: [
        { label: '検温者', value: 0 },
        { label: '受付者', value: 3 },
      ],
      destinationsRules: [(v) => v.length !== 0 || '送信先は必須です'],
      devicesRules: [(v) => v.length !== 0 || 'デバイスは必須です'],
      messageRules: [(v) => !!v || 'お知らせメッセージは必須です'],
      destinations: [],
      selectedDevices: [],
      message: '',
      devices: [],
      dialog1: false,
      headers: [
        { text: 'デバイス', align: 'center', value: 'serialno' },
        { text: '送信先', align: 'center', value: 'type' },
        { text: 'お知らせメッセージ', align: 'center', value: 'content' },
        { text: '登録日', align: 'center', value: 'created_at' },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      userMessages: [],
      deletedItem: null,
      loading: false,
    }
  },
  computed: {
    dialog: {
      get() {
        return this.isDisplay
      },
      set(value) {
        this.$emit('update:isDisplay', value)
      },
    },
  },
  async mounted() {
    this.loading = true
    const { data } = await this.$axios
      .get('/activestreamhc/devices')
      .catch((err) => {
        console.log(err)
      })
    this.devices = data
    this.loading = false
  },
  methods: {
    async onShowHistory() {
      const { data } = await this.$axios
        .get(`/activestreamhc/messages/${this.editUid}`)
        .catch((err) => {
          console.log(err)
        })
      this.userMessages = data
      this.dialog1 = true
    },
    onDeleteMessage(item) {
      this.$refs.dlg.isDisplay = true
      this.deletedItem = item
    },
    async confirmDeletion() {
      const { data } = await this.$axios
        .delete('/activestreamhc/message', {
          data: this.deletedItem,
        })
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        await this.onShowHistory()
      }
    },
    onClose() {
      this.dialog = false
      this.$refs.form.reset()
      this.$emit('close')
    },
    onSave() {
      if (this.$refs.form.validate()) {
        this.$emit('save', {
          destinations: this.destinations,
          devices: this.selectedDevices,
          message: this.message,
        })
        this.dialog = false
      }
    },
  },
}
</script>
