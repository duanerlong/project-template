<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="queues"
          item-key="uid"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>指令一覧</v-toolbar-title>
            </v-toolbar>
          </template>
          <template v-slot:[`item.created_at`]="{ item }">
            {{ item.created_at | formatDate }}
          </template>
          <template v-slot:[`item.method`]="{ item }">
            <div style="min-width: 150px;">
              {{ item.method | methodName }}
            </div>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <div style="min-width: 150px;">
              {{ item.status | statusName }}
            </div>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <div style="min-width: 120px;">
              <v-btn
                v-if="item.status === 0 || item.status === -1"
                color="error"
                class="ma-2"
                min-width="80"
                small
                @click="cancel(item.uid)"
                >キャンセル</v-btn
              >
            </div>
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
    const res = await $axios.get('/activestreamhc/queues').catch((err) => {
      console.log(err)
    })
    let data = {}
    if (res) {
      data = res.data
    }
    return { queues: data.queues }
  },
  data() {
    return {
      headers: [
        {
          text: '登録日',
          align: 'center',
          sortable: false,
          value: 'created_at',
        },
        { text: '目標デバイス', align: 'center', value: 'serialno' },
        { text: 'デバイス名', align: 'center', value: 'devicelabel' },
        { text: '指令内容', align: 'center', value: 'method' },
        { text: '状態', align: 'center', value: 'status' },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
    }
  },
  methods: {
    async cancel(uid) {
      await this.$axios
        .post(`/activestreamhc/queues/cancel/${uid}`)
        .catch((err) => {
          console.log(err)
        })
      const res = await this.$axios
        .get('/activestreamhc/queues')
        .catch((err) => {
          console.log(err)
        })
      this.queues = res.data.queues
    },
  },
}
</script>
