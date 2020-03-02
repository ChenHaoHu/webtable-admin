<template>
  <div class="app-container">
    <div class="sear">
      <el-date-picker v-model="sear.date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerOptions">
      </el-date-picker>
      <el-select v-model="sear.level" placeholder="请选择日志级别" style="width: 220px;">
        <el-option label="INFO" value="0"></el-option>
        <el-option label="WARNING" value="1"></el-option>
        <el-option label="ERROR" value="2"></el-option>
      </el-select>
      <el-input v-model="sear.username" placeholder="请输入用户名" style="width: 200px;"></el-input>
      <el-input v-model="sear.role" placeholder="请输入用户角色" style="width: 200px;"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">
        Search
      </el-button>
      <el-button :loading="downloadLoading" type="primary" icon="el-icon-download" @click="handleDownload">Export</el-button>
    </div>
    <br />
    <el-table :data="logs" border style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table :data="scope.row['sqlRecords']" style="width: 100%">
            <el-table-column prop="sql" label="SQL">
              <template slot-scope="scope">
                <el-alert :title="scope.row.sql" type="success" :closable="false">
                </el-alert>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="执行状态">
              <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row['state'] == true">执行成功</el-tag>
                <el-tag type="warning" v-if="scope.row['state'] == false">执行失败</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="values" label="执行参数">
              <template slot-scope="scope">
                <el-button type="primary" plain size="small" @click="lookSqlParams(scope.row['values'])">查看参数</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="error" label="错误描述">
              <template slot-scope="scope">
                <el-alert :title="scope.row.error" type="error" :closable="false">
                </el-alert>
              </template>
            </el-table-column>
            <el-table-column prop="executedTime" label="执行时间">
              <template slot-scope="scope">
                <el-link type="success" v-if="scope.row['executedTime']<=1000 &&
 scope.row['executedTime'] > 0"> {{scope.row['executedTime']}} ms</el-link>
                <el-link type="warning" v-if="scope.row['executedTime']>1000 &&
 scope.row['executedTime']<=2000"> {{scope.row['executedTime']}} ms</el-link>
                <el-link type="danger" v-if="scope.row['executedTime']> 2000"> {{scope.row['executedTime']}} ms</el-link>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="级别" width="100" sortable>
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row['level'] == 0">INFO</el-tag>
          <el-tag type="warning" v-if="scope.row['level'] == 1">WARNING</el-tag>
          <el-tag type="danger" v-if="scope.row['level'] == 2">ERROR</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="操作用户" width="200">
        <template slot-scope="scope">
          <div style="display: flex;">
            <div style="margin-right: 20px">{{scope.row['username']}}</div>
            <el-tag size="medium">{{ scope.row['role']}}</el-tag>
          </div>
        </template>
      </el-table-column>
      <!--       <el-table-column prop="role" label="角色">
      </el-table-column> -->
      <!--       <el-table-column prop="uri" label="uri">
      </el-table-column> -->
      <el-table-column prop="requestdesc" label="请求描述" width="200">
      </el-table-column>
      <el-table-column prop="params" label="请求参数">
        <template slot-scope="scope">
          <el-button type="primary" plain size="small" @click="lookRequestParams(scope.row['params'])">查看参数</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="response" label="返回描述" width="200">
      </el-table-column>
      <el-table-column prop="requestTime" label="请求时间" width="200" sortable>
        <template slot-scope="scope">
          {{new Date(scope.row["requestTime"]).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ")}}
        </template>
      </el-table-column>
      <el-table-column prop="requestTime" label="请求耗时" width="100">
        <template slot-scope="scope">
          <el-link type="danger" v-if="(scope.row['responseTime']-scope.row['requestTime'])<= 0">
            获取耗时失败
          </el-link>
          <el-link type="success" v-if="(scope.row['responseTime']-scope.row['requestTime'])<=1000 &&
 (scope.row['responseTime']-scope.row['requestTime']) > 0"> {{scope.row["responseTime"]-scope.row["requestTime"]}} ms</el-link>
          <el-link type="warning" v-if="(scope.row['responseTime']-scope.row['requestTime'])>1000 &&
 (scope.row['responseTime']-scope.row['requestTime'])<=2000"> {{scope.row["responseTime"]-scope.row["requestTime"]}} ms</el-link>
          <el-link type="danger" v-if="(scope.row['responseTime']-scope.row['requestTime'])> 2000"> {{scope.row["responseTime"]-scope.row["requestTime"]}} ms</el-link>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="请求参数" :visible.sync="dialogVisible" width="30%">
      <json-viewer :expand-depth=0 :value="requestParams"></json-viewer>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="SQL执行参数" :visible.sync="dialogSqlVisible" width="30%">
      <json-viewer :expand-depth=0 :value="sqlParams"></json-viewer>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogSqlVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getlogs } from "@/api/wadmin";
export default {
  data() {
    return {
      requestParams: [],
      dialogVisible: false,
      dialogSqlVisible: false,
      downloadLoading: false,
      sqlParams: [],
      sear: {
        date: []
      },
      logs: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      }
    };
  },
  mounted() {
    this.getData();
  },

  methods: {
    lookSqlParams(params) {
      this.dialogSqlVisible = true
      this.sqlParams = [];
      console.log(params)
      this.sqlParams = params;
    },
    lookRequestParams(params) {
      this.dialogVisible = true
      this.requestParams = [];
      this.requestParams = JSON.parse(params);
    },
    handleDownload() {
      this.downloadLoading = true;
      var that = this;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = ["级别", "用户", "角色", "请求描述", "请求参数", "返回描述", "请求时间"];
        const filterVal = ["level", "username", "role", "requestdesc", "params", "response", "time"];
        const data = that.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "webtable logs-" + this.timestampToTime(this.logs[this.logs.length - 1]["time"] / 1000).split(" ")[0] + "至" + this.timestampToTime(this.logs[0]["time"] / 1000).split(" ")[0]
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      console.log(this.logs);
      console.log(filterVal);
      return this.logs.map(v =>
        filterVal.map(j => {
          if (j == "level") {
            if (v[j] == 0) {
              return "INFO";
            }
            if (v[j] == 1) {
              return "WARNING";
            }
            if (v[j] == 2) {
              return "ERROR";
            }
          }
          if (j == "time") {
            return this.timestampToTime(v[j] / 1000);
          }
          return v[j];

        })
      );
    },
    handleSearch() {
      this.getData();
    },

    getData() {


      var data = {
        u: "glogs",
        user: this.sear.username,
        role: this.sear.role,
        level: this.sear.level,
        start: this.sear.date[0] / 1000,
        end: this.sear.date[1] / 1000,
      };
      getlogs(data)
        .then(response => {
          if (response.code == 1000) {
            this.$message({
              message: '获取日志数据成功',
              type: 'success'
            });
            this.logs = response.data.data
          }
        }).catch(error => {
          console.log(error);
          alert("加载数据出错");
        });
    },

    timestampToTime(timestamp) {
      var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      var D = date.getDate() + ' ';
      var h = date.getHours() + ':';
      var m = date.getMinutes() + ':';
      var s = date.getSeconds();
      return Y + M + D + h + m + s;
    }
  }

}

</script>
<style scoped>
.line {
  text-align: center;
}

.sear div {
  margin-bottom: 20px;
}

</style>
