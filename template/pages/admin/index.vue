<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-card
        min-height="655"
        class="d-flex flex-column align-center justify-center"
      >
        <v-card-title class="text-h1">
          工事中
          <doughnut-chart :chart-data="chartData" :options="chartOptions" />
          <line-chart :chart-data="chartData" :options="chartOptions" />
          <bar-chart :chart-data="chartData" :options="chartOptions" />
          <horizontal-bar-chart
            :chart-data="chartData"
            :options="chartOptions"
          />
          <pie-chart :chart-data="chartData" :options="chartOptions" />
          <polar-area-chart :chart-data="chartData" :options="chartOptions" />
          <radar-chart :chart-data="chartData" :options="chartOptions" />
          <bubble-chart :chart-data="chartData" :options="chartOptions" />
          <scatter-chart :chart-data="aaa" :options="chartOptions" />
          <div class="text-xs-center mt-2">
            <v-btn dark color="indigo" @click="randomizeData()"
              >Randomize data</v-btn
            >
          </div>
          <client-only>
            <v-data-table
              :headers="headers"
              :items="items"
              class="elevation-1"
              :footer-props="{
                itemsPerPageText: '表示件数',
                itemsPerPageOptions: [10, 50, 100, -1],
              }"
            >
            </v-data-table>
          </client-only>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import colors from 'vuetify/es5/util/colors'
export default {
  layout: 'admin',
  components: {},
  data() {
    return {
      chartDataValues: [],
      chartColors: [
        colors.red.lighten1,
        colors.blue.lighten1,
        colors.yellow.lighten1,
        colors.green.lighten1,
      ],
      chartLabels: ['red', 'blue', 'yellow', 'green'],
      chartOptions: {
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeInOutCubic',
        },
      },
      aaa: {
        datasets: [
          {
            label: 'My First dataset',
            borderColor: colors.red.lighten1,
            backgroundColor: colors.red.lighten1,
            data: [
              {
                x: 1,
                y: 2,
              },
              {
                x: 1,
                y: 5,
              },
            ],
          },
        ],
      },
      headers: [],
      items: [],
    }
  },
  fetch({ redirect }) {
    redirect(301, '/admin/device')
  },
  computed: {
    chartData() {
      return {
        datasets: [
          {
            data: this.chartDataValues,
            backgroundColor: this.chartColors,
          },
        ],
        labels: this.chartLabels,
      }
    },
  },
  mounted() {
    this.randomizeData()
  },
  methods: {
    async randomizeData() {
      const data = []
      for (let i = 0; i < this.chartLabels.length; i++) {
        data.push(Math.floor(Math.random() * 100))
      }
      this.chartDataValues = data
      const res = await this.$axios
        .get('/activestreamhc/logs/attendance-of-monthly', {
          params: {
            date: new Date().toLocaleDateString(),
          },
        })
        .catch((err) => {
          console.log(err)
        })

      console.log(res)
      if (res && res.data && res.data.length > 0) {
        Object.keys(res.data[0]).forEach((key) => {
          this.headers.push({
            text: key.split('/')[2],
            align: 'center',
            value: key,
          })
        })
        this.items = res.data
      }
    },
  },
}
</script>
