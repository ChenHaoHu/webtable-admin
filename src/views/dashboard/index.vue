<template>
  <div class="dashboard-container">
    <div class="charts">
      <div class="chart" v-for="(item,index) in chartsData">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{item.title}}</span>
          </div>
          <LineChart1 :chart-data="item" v-if="item.type == '1'" />
          <LineChart2 :chart-data="item" v-if="item.type == '2'" />
          <BarChart :chart-data="item" v-if="item.type == '3'" />
          <PieChart1 :chart-data="item" v-if="item.type == '4'" />
          <PieChart2 :chart-data="item" v-if="item.type == '5'" />
          <PieChart3 :chart-data="item" v-if="item.type == '6'" />
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

import { gethomepage } from "@/api/table";

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
      chartsData: []
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {


    var data = {
      u: "ghomepage",

    };
    gethomepage(data)
      .then(response => {

        if (response.code == 1000) {

          var { data } = response.data

          var list = []

          for (var i = 0; i < data.length; i++) {
            list.push({
              xdata: data[i].chart.xvalues,
              ydata: data[i].chart.yvalues,
              title: data[i].chart.title == "" ? data[i].title : data[i].chart.title,
              xname: data[i].chart.xname,
              type: data[i].chart.type,
              yname: data[i].chart.yname,
            })
          }

          this.chartsData = list;


        } else {
          this.$message.error(response.msg);
        }

      })
      .catch(error => {
        console.log(error);
        this.$message.error('请求出错');
      });
  }

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
