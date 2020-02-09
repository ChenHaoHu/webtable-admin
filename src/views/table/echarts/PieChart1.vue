<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>
<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  name: "",
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
      default: '350px'
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
      chart: null,
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {

        var x = val.xdata;
        var y = val.ydata;
        var name = val.name
        var title = val.title

        var size = x.length

        var seriesData = [];
        var legendData = [];

        for (var i = 0; i < size; i++) {
          legendData.push(x[i]);
          var xv = x[i];
          seriesData.push({
            name: xv,
            value: y[i],
          });
        }


        this.setOptions({ title, name, legendData, seriesData })
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
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
      var val = this.chartData;
      var x = val.xdata;
      var y = val.ydata;
      var name = val.name
      var title = val.title

      var size = x.length

      var seriesData = [];
      var legendData = [];

      for (var i = 0; i < size; i++) {
        legendData.push(x[i]);
        var xv = x[i];
        seriesData.push({
          name: xv,
          value: y[i],
        });
      }

      this.setOptions({ title, name, legendData, seriesData })
    },

    setOptions({ title, name, legendData, seriesData } = {}) {


      this.chart.setOption({
        title: {
          text: title,
          left: 'center'
        },

        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: legendData
        },
         series: [{
          name: name,
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: seriesData,
          animationEasing: 'cubicInOut',
          animationDuration: 2600
        }]
      })
    }
  }
}

</script>
