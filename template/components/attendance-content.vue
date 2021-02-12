<template>
  <article class="page">
    <v-sheet class="inner_wrap" color="white" elevation="1" rounded shaped>
      <section class="header">
        <v-row>
          <v-col cols="8" class="pa-0 d-flex justify-center align-center">
            <div>
              <h1 class="text-center">{{ user.name }}</h1>
            </div>
          </v-col>
          <v-col cols="4" class="pa-0">
            <v-sheet
              class="photo_wrap ml-auto"
              color="white"
              elevation="2"
              rounded
              shaped
            >
              <img v-if="photo" :src="photo" class="pa-1" />
            </v-sheet>
          </v-col>
        </v-row>
        <h1 class="date">{{ date | formatDate('YYYY年MM月') }}</h1>
      </section>
      <section class="content">
        <v-simple-table dense>
          <template v-slot:default>
            <tbody>
              <template v-for="n in 31">
                <tr v-if="list[n - 1]" class="item pa-0" :key="n">
                  <td
                    class="text-right"
                    :class="list[n - 1].date | isHoliday"
                    style="width: 50px;"
                  >
                    {{ list[n - 1].date | formatDate('D日(ddd)') }}
                  </td>
                  <td class="text-center px-1">
                    <div
                      v-if="
                        list[n - 1].created_at_min || list[n - 1].created_at_max
                      "
                    >
                      {{ list[n - 1].created_at_min | formatDate('HH:mm') }}
                      <span>〜</span>
                      {{ list[n - 1].created_at_max | formatDate('HH:mm') }}
                    </div>
                  </td>
                  <td class="text-left">
                    <div v-if="list[n - 1].hours">
                      <small>滞在:</small>
                      {{
                        `1900-01-01 ${list[n - 1].hours}`
                          | formatDate('HH時間mm分')
                      }}
                    </div>
                  </td>
                  <td class="text-center">
                    <div
                      v-if="list[n - 1].temperature_avg"
                      :class="[
                        Number(list[n - 1].temperature_avg) >
                        Number(list[n - 1].warning_temperature)
                          ? 'red--text'
                          : '',
                      ]"
                    >
                      {{ list[n - 1].temperature_avg }}°C<span>(平均)</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <div
                      v-if="list[n - 1].temperature_max"
                      :class="[
                        Number(list[n - 1].temperature_max) >
                        Number(list[n - 1].warning_temperature)
                          ? 'red--text'
                          : '',
                      ]"
                    >
                      {{ list[n - 1].temperature_max }}°C<span>(最高)</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <div
                      v-if="list[n - 1].temperature_min"
                      :class="[
                        Number(list[n - 1].temperature_min) >
                        Number(list[n - 1].warning_temperature)
                          ? 'red--text'
                          : '',
                      ]"
                    >
                      {{ list[n - 1].temperature_min }}°C<span>(最低)</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div v-if="list[n - 1].cnt">
                      <span>検温</span>{{ list[n - 1].cnt }}回
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </template>
        </v-simple-table>
      </section>
      <section class="footer">
        <div class="seal-container">
          <div class="seal"></div>
          <div class="seal"></div>
          <div class="seal"></div>
        </div>
      </section>
    </v-sheet>
  </article>
</template>

<style lang="scss" scoped>
.page {
  position: relative;
  margin: 56px;
  width: 655px;
  .inner_wrap {
    padding: 32px;
  }
  .header {
    position: relative;
    height: 200px;
    .photo_wrap {
      height: 160px;
      width: 120px;
      display: flex;
      img {
        width: 100%;
        margin: auto;
      }
    }
    .date {
      position: absolute;
      text-align: left;
      left: 12px;
      bottom: 12px;
    }
  }
  .content {
    .item {
      height: 20px;
      line-height: 20px;
      border-bottom: solid 1px #80808047;
      &:first-child {
        border-top: solid 1px #80808047;
      }
      td {
        height: 20px;
        padding: 0;
      }
      * {
        font-size: 10px;
        font-weight: bold;
      }
    }
  }
  section {
    border-left: solid;
    border-right: solid;
    padding: 16px 32px;
  }
  section:first-child {
    border-top: solid;
    border-bottom: solid 2px;
  }
  section:last-child {
    border-top: solid 2px;
    border-bottom: solid;
    // height: 180px;
  }
  .footer {
    position: relative;
    height: 100px;
    .seal-container {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 12px;
      display: flex;
      .seal {
        height: 60px;
        width: 60px;
        border: solid 2px;
        &:first-child {
          border-right: none;
        }
        &:last-child {
          border-left: none;
        }
      }
    }
  }
}

@media print {
  .page {
    width: 172mm;
    height: 251mm;
    page-break-after: always;
    .inner_wrap {
      padding: 0;
    }
  }
  .page:last-child {
    page-break-after: auto;
  }
  .page::before {
    position: absolute;
    right: 16px;
    top: -56px;
    color: #ff000075;
    font-size: xx-large;
    content: '関係者外秘';
  }
  //   .page::after {
  //     position: absolute;
  //     right: 0;
  //     bottom: 0;
  //     content: counter(page_count) 'ページ';
  //   }
}
</style>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    date() {
      const data = this.data || {}
      return data.date
    },
    user() {
      const data = this.data || {}
      return data.user
    },
    list() {
      const data = this.data || {}
      return data.list
    },
    photo() {
      if (this.user.photo) {
        return `/${this.user.photo}`
      } else {
        return null
      }
    },
  },
}
</script>
