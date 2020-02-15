<template>
  <div class="dashboard-container">
    <div class="charts">
      <div class="chart">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>卡片名称1</span>
          </div>
          <PieChart3 :chart-data="chartsData" style="width: 100%" />
        </el-card>
      </div>
      <div class="chart">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>卡片名称2</span>
          </div>
          <BarChart :chart-data="chartsData" style="width: 100%" />
        </el-card>
      </div>
      <div class="chart">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>卡片名称3</span>
          </div>
          <LineChart1 :chart-data="chartsData" style="width: 100%" />
        </el-card>
      </div>
      <div class="chart">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>卡片名称4</span>
          </div>
          <BarChart :chart-data="chartsData" style="width: 100%" />
        </el-card>
      </div>
      <div class="chart">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>卡片名称5</span>
          </div>
          <PieChart1 :chart-data="chartsData" style="width: 100%" />
        </el-card>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import LineChart1 from '@/views/table/echarts/LineChart1'
import LineChart2 from '@/views/table/echarts/LineChart2'
import PieChart1 from '@/views/table/echarts/PieChart1'
import PieChart2 from '@/views/table/echarts/PieChart2'
import PieChart3 from '@/views/table/echarts/PieChart3'
import BarChart from '@/views/table/echarts/BarChart'

export default {
  components: {

    LineChart1,
    LineChart2,
    PieChart1,
    PieChart2,
    PieChart3,
    BarChart


  },
  name: 'Dashboard',
  data() {
    return {
      chartsData: { "xdata": ["aaa", "bbb", "ccc", "ddd"], "ydata": [100, 200, 300, 400], "title": "aaa", "xname": "测试横坐标", "yname": "测试竖坐标" }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },

}

</script>
<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    // line-height: 46px;
  }
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.charts {
  column-count: 2;
}

.chart {
  width: 100%;
  margin-bottom: 30px;
  break-inside: avoid;
}

@media (min-width: 992px) and (max-width: 1300px) {
  .charts {
    column-count: 1;
  }

}

@media (min-width: 768px) and (max-width: 991px) {
  .charts {
    column-count: 1;
  }

}

@media (max-width: 767px) {
  .charts {
    column-count: 1;
  }
}

</style>
