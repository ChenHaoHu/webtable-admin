<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>
<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)

      }

    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.setOptions(this.chartData)
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },

     setOptions({xname,yname, title, name, xdata, ydata } = {}) {
      this.chart.setOption({
          title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: 40,
          left: '2%',
          right: '12%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          name:xname,
          type: 'category',
          data: xdata,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          name:yname,
          type: 'value',
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: name,
          type: 'bar',
          data: ydata,
          animationDuration
        }]
      })
  }
}
}

</script>
