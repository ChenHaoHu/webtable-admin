<template>
  <div class="app-container" v-if="permission.indexOf('find')>-1">
    <div class="filter-container" v-for="i in searchNum">
      <i class="el-icon-remove-outline" :id="i" @click="deleteSearchNum(i)"></i>
      <el-select v-model="searchType[i]" placeholder="Type" class="filter-item" style="width: 130px">
        <el-option v-for="item in searchTypes" :label="item.name" :value="item.value" />
      </el-select>
      <el-select v-model="searchField[i]" style="width: 140px" class="filter-item">
        <el-option v-for="(item,index) in findFields" :label="item.alias" :value="index" />
      </el-select>
      <el-input v-model="queryText[i]" placeholder="search" style="width: 200px;" class="filter-item" type="number" v-if="searchType[i] != 'equals' && searchType[i] != 'like'" />
      <el-input v-model="queryText[i]" placeholder="search" style="width: 200px;" class="filter-item" type="text" v-else />
    </div>
    <div class="filter-container">
      <i class="el-icon-circle-plus-outline" @click="addSearchNum" v-if="permission.indexOf('find')>-1"></i>
      <!-- 查询类型 -->
      <el-select v-model="searchType[0]" placeholder="Type" class="filter-item" style="width: 130px" v-if="permission.indexOf('find')>-1">
        <el-option v-for="item in searchTypes" :label="item.name" :value="item.value" />
      </el-select>
      <!-- 查询字段 -->
      <el-select v-model="searchField[0]" style="width: 140px" class="filter-item" v-if="permission.indexOf('find')>-1">
        <el-option v-for="(item,index) in findFields" :label="item.alias" :value="index" />
      </el-select>
      <!-- 查询文字 -->
      <!-- <el-input v-model="queryText[0]" placeholder="search" style="width: 200px;" class="filter-item" v-if="permission.indexOf('find')>-1" /> -->
      <el-input v-model="queryText[0]" placeholder="search" style="width: 200px;" class="filter-item" type="number" v-if="permission.indexOf('find')>-1 && (searchType[0] != 'equals'&& searchType[0] != 'like')" />
      <el-input v-model="queryText[0]" placeholder="search" style="width: 200px;" class="filter-item" type="text" v-else />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch" v-if="permission.indexOf('find')>-1">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd" v-if="permission.indexOf('insert')>-1">Add</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">Export</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-refresh-left" @click="refreshData">refresh</el-button>
      <el-dropdown class="filter-item" style="margin-left: 10px;" @command="selectChart" v-if="readyCharts!=null">
        <el-button type="primary" icon="el-icon-s-grid">
          查看视图
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item,index) in readyCharts" :command="item">{{index}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-s-data" @click="makeChartVisible = true">
        制作视图
      </el-button>
    </div>
    <el-checkbox-group v-model="choiceFields">
      <el-checkbox :label="index" v-for="(item,index) in defultFields" checked>{{item.alias}}</el-checkbox>
      <el-checkbox label="remoteSort">远程排序</el-checkbox>
    </el-checkbox-group>
    <br />
    <el-pagination style="overflow: auto;" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalNum"></el-pagination>
    <br />
    <el-table :data="tableData" border style="width: 100%" @sort-change="sortChange"   v-loading="loading"  >
      <el-table-column :prop="index" :label="item.alias" v-for="(item,index) in fields" :sortable="(choiceFields.indexOf('remoteSort') == -1) ||  (sortFields.indexOf(index) > -1)">
        <template slot-scope="scope">
          <div v-if="(item.webFieldType == 'String'||item.webFieldType == 'Number') && scope.row[index]!= undefined && scope.row[index].toString().length>20 ">
            <el-tooltip :content="scope.row[index]" placement="bottom" effect="light">
              <span> {{scope.row[index].slice(0,20)+"..."}}</span>
            </el-tooltip>
          </div>
          <div v-if="(item.webFieldType == 'String'||item.webFieldType == 'Number') && scope.row[index]!= undefined && scope.row[index].toString().length<=20 ">{{scope.row[index]}}</div>
          <img height="50px;" :src="scope.row[index]" v-if="item.webFieldType == 'ImageURL'" @click="previewImage(scope.row[index])" />
          <img height="50px;" :src="scope.row[index]" v-if="item.webFieldType == 'ImageBASE64'" @click="previewImage(scope.row[index])" />
          <div v-if="item.webFieldType == 'Select'">{{item.selectArr[scope.row[index]]}}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <div style="text-align: center;">
            <el-button @click="handleLook(scope.row)" type="text" size="small">查看</el-button>
            <el-button @click="handleUpdate(scope.row)" type="text" size="small" v-if="permission.indexOf('update')>-1">编辑</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="small" v-if="permission.indexOf('delete')>-1">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <br />
    <el-dialog title="Preview" :visible.sync="dialogPreviewVisible">
      <img width="98%;" style=" margin-left:1%; " :src="previewImageUrl" />
    </el-dialog>
    <el-dialog title="Look" :visible.sync="dialogLookVisible">
      <form>
        <el-form label-width="80px">
          <el-form-item :label="item.alias" v-for="(item,index) in  lookFields">
            <!-- //String/ -->
            <el-input v-model="item.value" v-if="item.webFieldType == 'String'" disabled></el-input>
            <!-- //Number/ -->
            <el-input v-model="item.value" v-if="item.webFieldType == 'Number'" disabled></el-input>
            <!-- //select/ -->
            <el-input v-model="item.selectArr[item.value]" disabled v-if="item.webFieldType == 'Select'"></el-input>
            <!-- //pic/ -->
            <!--   <input v-if="item.webFieldType == 'ImageBASE64' || item.webFieldType == 'ImageURL'" name="big_ticket" type="file" value="" accept="image/jpg,image/jpeg,image/png,image/gif" style="filter:alpha(opacity=0);opacity:0;width: 0;height: 0;" :id="index" @change="getFilePath(index)" /> -->
            <div v-if="item.webFieldType == 'ImageBASE64' || item.webFieldType == 'ImageURL'">
              <img v-if="item.value != ''" :src="item.value" class="avatar" @click="previewImage(item.value)">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </el-form-item>
        </el-form>
      </form>
    </el-dialog>
    <el-dialog title="Add" :visible.sync="dialogAddVisible">
      <form>
        <el-form label-width="80px">
          <el-form-item :label="item.alias" v-for="(item,index) in  insertFields">
            <!-- //String/ -->
            <el-input v-model="item.value" v-if="item.webFieldType == 'String'" required></el-input>
            <!-- //Number/ -->
            <el-input v-model="item.value" v-if="item.webFieldType == 'Number'" type="number"></el-input>
            <!-- //select/ -->
            <el-select v-model="item.value" placeholder="please select" v-if="item.webFieldType == 'Select'">
              <el-option :label="selectItem" :value="selectIndex" v-for="(selectItem,selectIndex) in  item.selectArr"></el-option>
            </el-select>
            <!-- //pic/ -->
            <input v-if="item.webFieldType == 'ImageBASE64' || item.webFieldType == 'ImageURL'" name="big_ticket" type="file" value="" accept="image/jpg,image/jpeg,image/png,image/gif" style="filter:alpha(opacity=0);opacity:0;width: 0;height: 0;" :id="index" @change="getFilePath(index)" />
            <div v-if="item.webFieldType == 'ImageBASE64' || item.webFieldType == 'ImageURL'" @click="chooseImg(index)">
              <img v-if="item.value != ''" :src="item.value" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addData">Confirm</el-button>
            <el-button @click="cancelAdd()">Cancel</el-button>
          </el-form-item>
        </el-form>
      </form>
    </el-dialog>
    <el-dialog title="Update" :visible.sync="dialogUpdateVisible">
      <form>
        <el-form label-width="80px">
          <el-form-item :label="item.alias" v-for="(item,index) in  updateFields">
            <!-- //String/ -->
            <el-input v-model="item.value" v-if="item.webFieldType == 'String'" required></el-input>
            <!-- //Number/ -->
            <el-input v-model="item.value" v-if="item.webFieldType == 'Number'" type="number"></el-input>
            <!-- //select/ -->
            <el-select v-model="item.value" placeholder="please select" v-if="item.webFieldType == 'Select'">
              <el-option :label="selectItem" :value="selectIndex" v-for="(selectItem,selectIndex) in  item.selectArr"></el-option>
            </el-select>
            <!-- //pic/ -->
            <input v-if="item.webFieldType == 'ImageBASE64' || item.webFieldType == 'ImageURL'" name="big_ticket" type="file" value="" accept="image/jpg,image/jpeg,image/png,image/gif" style="filter:alpha(opacity=0);opacity:0;width: 0;height: 0;" :id="index" @change="getFilePath(index)" />
            <div v-if="item.webFieldType == 'ImageBASE64' || item.webFieldType == 'ImageURL'" @click="chooseImg(index)">
              <img v-if="item.value != ''" :src="item.value" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateData">Confirm</el-button>
            <el-button @click="cancelUpdate()">Cancel</el-button>
          </el-form-item>
        </el-form>
      </form>
    </el-dialog>
    <el-dialog title="制作可视化视图" :visible.sync="makeChartVisible" width="80%">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form ref="form" :model="buildChartForm" label-width="150px" style="width: 80%;">
            <el-form-item label="可视化表名称" class="block">
              <el-input v-model="buildChartForm.title" placeholder="可视化表名称"></el-input>
            </el-form-item>
            <el-form-item label="可视化类型">
              <el-select v-model="buildChartForm.charttype" placeholder="请选择">
                <el-option v-for="item in chartType" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="X  数据" v-if="buildChartForm.charttype < '4'">
              <el-select v-model="buildChartForm.x" placeholder="请选择">
                <el-option v-for="(item,index) in fields" :label="item.alias" :value="index">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Y 数据" v-if="buildChartForm.charttype < '4'">
              <el-select v-model="buildChartForm.y" placeholder="请选择">
                <el-option v-for="(item,index) in fields" :label="item.alias" :value="index">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Name" v-if="buildChartForm.charttype >= '4'">
              <el-select v-model="buildChartForm.x" placeholder="请选择">
                <el-option v-for="(item,index) in fields" :label="item.alias" :value="index">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="value" v-if="buildChartForm.charttype >= '4'">
              <el-select v-model="buildChartForm.y" placeholder="请选择">
                <el-option v-for="(item,index) in fields" :label="item.alias" :value="index">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="'数据范围 ['+buildChartForm.datarange+'] '" class="block">
              <el-slider v-model="buildChartForm.datarange" range show-stops :max="tableData.length" color:red>
              </el-slider>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <LineChart1 :chart-data="chartsData" v-if="buildChartForm.charttype == '1'" />
          <LineChart2 :chart-data="chartsData" v-if="buildChartForm.charttype == '2'" />
          <BarChart :chart-data="chartsData" v-if="buildChartForm.charttype == '3'" />
          <PieChart1 :chart-data="chartsData" v-if="buildChartForm.charttype == '4'" />
          <PieChart2 :chart-data="chartsData" v-if="buildChartForm.charttype == '5'" />
          <PieChart3 :chart-data="chartsData" v-if="buildChartForm.charttype == '6'" />
        </el-col>
      </el-row>
      <div style="position: absolute;bottom: 10px;right: 20px;">
        <i class="el-icon-full-screen" @click="showMaxCharts"></i>
      </div>
    </el-dialog>
    <el-dialog title="可视化大图" :visible.sync="dialogMaxChartVisible">
      <el-row :gutter="20">
        <LineChart1 :chart-data="chartsMaxData" v-if="maxChartsType == '1'" style="width: 100%" />
        <LineChart2 :chart-data="chartsMaxData" v-if="maxChartsType == '2'" style="width: 100%" />
        <BarChart :chart-data="chartsMaxData" v-if="maxChartsType == '3'" style="width: 100%" />
        <PieChart1 :chart-data="chartsMaxData" v-if="maxChartsType == '4'" style="width: 100%" />
        <PieChart2 :chart-data="chartsMaxData" v-if="maxChartsType == '5'" style="width: 100%" />
        <PieChart3 :chart-data="chartsMaxData" v-if="maxChartsType == '6'" style="width: 100%" />
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { getList, addItem, deleteItem, updateItem } from "@/api/table";

import LineChart1 from './echarts/LineChart1'
import LineChart2 from './echarts/LineChart2'
import PieChart1 from './echarts/PieChart1'
import PieChart2 from './echarts/PieChart2'
import PieChart3 from './echarts/PieChart3'
import BarChart from './echarts/BarChart'

export default {
  components: {

    LineChart1,
    LineChart2,
    PieChart1,
    PieChart2,
    PieChart3,
    BarChart


  },
  data() {
    return {
      loading:false,
      readyCharts: {},
      pageSizes: "",
      maxChartsType: "",
      chartsMaxData: {},
      localSort: false,
      dialogMaxChartVisible: false,
      chartsData: {
        xdata: [],
        ydata: [],
        name: "",
      },
      buildChartForm: {},
      chartType: [{
        label: "曲线图",
        value: "1"
      }, {
        label: "折线图",
        value: "2"
      }, {
        label: "柱形图",
        value: "3"
      }, {
        label: "饼状图1",
        value: "4"
      }, {
        label: "饼状图2",
        value: "5"
      }, {
        label: "饼状图3",
        value: "6"
      }, ],
      makeChartVisible: false,
      searchNum: 0,
      searchField: [],
      searchType: [],
      searchTypes: [{
        name: "模糊查询",
        value: "like",
      }, {
        name: "精确查询",
        value: "equals",
      }, {
        name: "大于",
        value: "greater",
      }, {
        name: "小于",
        value: "less",
      }, {
        name: "大于等于",
        value: "greaterAndequals",
      }, {
        name: "小于等于",
        value: "lessAndequals",
      }],
      queryText: [],
      permission: [],
      addform: {},
      dialogLookVisible: false,
      dialogAddVisible: false,
      dialogUpdateVisible: false,
      totalNum: 100,
      pageSize: 6,
      currentPage: 1,
      downloadLoading: false,
      table: this.$route.name,
      tableData: [],
      choiceFields: [],
      fields: {},
      fieldsNameArr: [],
      fieldsAliasNameArr: [],
      defultFields: {},
      updateFields: {},
      insertFields: {},
      findFields: {},
      lookFields: {},
      sortFields: {},
      dialogPreviewVisible: false,
      previewImageUrl: "http://p0.qhimg.com/bdm/720_444_0/t01bb9210f980080236.jpg",
      tempUpdateRow: {},
      // likeData: {},
      findData: [],
      sort: null
    };
  },

  mounted() {
    this.initData();
  },
  methods: {

    selectChart(data) {
      var that = this;
      var data = {
        u: "gchart",
        table: that.table,
        chart: data,
      };
      updateItem(data)
        .then(response => {
          console.log(response);
          if (response.code == 1000) {
            var { data } = response.data;

            that.maxChartsType = data.type;
            that.chartsMaxData = {
              xdata: data.xvalues,
              ydata: data.yvalues,
              name: data.name,
              xname:data.xname,
              yname:data.yname,
            }
            that.dialogMaxChartVisible = true

          } else {
            this.$message.error(response.msg);
          }

        })
        .catch(error => {
          console.log(error);
          alert("请求出错");
        });
    },

    showMaxCharts() {
      this.dialogMaxChartVisible = true
      this.chartsMaxData = this.chartsData;
      this.maxChartsType = this.buildChartForm.charttype;
    },

    sortChange(data) {

      const { prop, order } = data
      var sortFields = this.sortFields;
      var tableData = this.tableData;
      var that = this;

      if (this.choiceFields.indexOf('remoteSort') == -1) {
        function compare(val1, val2) {
          if (order == "ascending") {
            if (!isNaN(val1[prop])) {
              return val1[prop] - val2[prop];
            } else {
              return val1[prop].length - val2[prop].length;
            }
          } else {
            if (!isNaN(val1[prop])) {
              return val2[prop] - val1[prop];
            } else {
              return val2[prop].length - val1[prop].length;
            }
          }
        };

        tableData.sort(compare);
        this.tableData = tableData;
      } else {
        var sort = {}
        sort["field"] = prop;
        if (order == "ascending") {
          sort["desc"] = false;
        } else {
          sort["desc"] = true;
        }
        that.sort = sort;
        that.initData();

        that.sort = null;
      }
    },
    deleteSearchNum(i) {
      this.searchField.splice(i, 1);
      this.searchType.splice(i, 1);
      this.queryText.splice(i, 1);
      this.searchNum--;

    },
    addSearchNum() {
      this.searchNum++;
    },
    handleSearch() {
      this.findData = []
      this.likeData = {}
      var searchTypes = this.searchType;
      var searchFields = this.searchField;
      var queryTexts = this.queryText;
      //检验是否都填写
      if (searchTypes.length != 0 && searchTypes.length == searchFields.length && searchTypes.length == queryTexts.length) {

        if (searchTypes.length > 1) {
          this.$message('重复搜索条件会覆盖(上面会覆盖下面)');
        }

        var findData = [];
        for (var i = 0; i < searchTypes.length; i++) {
          // if (this.searchType[i] == "equal") {
          //   this.findData[this.searchField[i]] = this.queryText[i]
          // } 

          //  if (this.searchType[i] == "like") { 
          //   //like
          //   this.likeData[this.searchField[i]] = this.queryText[i]
          // }
          findData.push({
            key: this.searchField[i],
            value: this.queryText[i],
            compare: this.searchType[i]
          })
        }
        this.findData = findData;

      } else {
        this.$message.error('搜索条件不完整');
      }

      this.initData();
    },
    updateData() {

      var that = this;
      var form = this.updateFields;
      var fields = {}
      for (var key in form) {

        if (form[key]['value'] == '') {
          this.$message.error('添加表单有未填写项');
          return;
        }
        fields[key] = form[key]['value'];
      }

      //主键处理
      var row = this.tempUpdateRow;
      var pk = {}
      console.log(row)
      for (var key in row) {
        if (key.indexOf("pk_") == 0) {
          pk[key.slice(3)] = row[key]
        }
      }

      var data = {
        u: "utable",
        table: that.table,
        fields: fields,
        pk: pk
      };
      updateItem(data)
        .then(response => {
          console.log(response);
          if (response.code == 1017) {
            this.$message({
              message: '更新成功',
              type: 'success'
            });
            that.initData()
            that.dialogUpdateVisible = false;

          } else {
            this.$message.error(response.msg);
          }

        })
        .catch(error => {
          console.log(error);
          alert("请求出错");
        });

    },
    cancelUpdate() {
      this.dialogUpdateVisible = false;
    },
    handleUpdate(row) {
      this.dialogUpdateVisible = true;
      this.tempUpdateRow = row;
      var fields = this.updateFields;

      for (var key in fields) {
        fields[key]['value'] = row[key]
      }
      console.log(fields)
      this.updateFields = fields;
    },
    handleLook(row) {

      var fields = this.defultFields;

      for (var key in fields) {
        fields[key]['value'] = row[key]
      }

      console.log(fields)
      this.lookFields = fields;
      this.dialogLookVisible = true;

    },
    handleDelete(row) {

      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        var that = this;
        console.log(row)
        var pk = {}

        for (var key in row) {
          if (key.indexOf("pk_") == 0) {
            pk[key.slice(3)] = row[key]
          }
        }

        var data = {
          u: "dtable",
          table: that.table,
          fields: pk
        }

        deleteItem(data)
          .then(response => {
            console.log(response);
            if (response.code == 1021) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
              that.initData()

            } else {
              this.$message.error(response.msg);
            }

          })
          .catch(error => {
            console.log(error);
            alert("请求出错");
          });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    chooseImg(id) {
      var item = document.getElementById(id);
      item.click();
    },
    getFilePath(id) {
      var that = this;
      var item = document.getElementById(id);
      if (item.files.length == 1) {
        var reader = new FileReader();
        reader.readAsDataURL(item.files[0]);
        reader.onloadend = function() {
          // console.log(reader.result);
          that.insertFields[id]['value'] = reader.result
        }
      }
    },

    addData() {
      var that = this;
      var form = this.insertFields;
      var fields = {}
      for (var key in form) {

        if (form[key]['value'] == '') {
          this.$message.error('添加表单有未填写项');
          return;
        }
        fields[key] = form[key]['value'];
      }
      console.log(fields)

      var data = {
        u: "atable",
        table: that.table,
        fields: fields
      };
      addItem(data)
        .then(response => {
          console.log(response);
          if (response.code == 1019) {
            this.$message({
              message: '插入成功',
              type: 'success'
            });
            that.initData()
            that.dialogAddVisible = false;

          } else {
            this.$message.error(response.msg);
          }

        })
        .catch(error => {
          console.log(error);
          alert("请求出错");
        });
    },
    handleAdd() {
      this.dialogAddVisible = true;
    },
    cancelAdd() {
      this.dialogAddVisible = false;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.initData();
    },
    refreshData() {
      this.findData = []
      // this.likeData = {}
      this.initData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.initData();
    },
    handleClick(row) {
      console.log(row);
    },
    previewImage(data) {
      this.previewImageUrl = data;
      this.dialogPreviewVisible = true;
    },
    handleDownload() {
      this.downloadLoading = true;
      var that = this;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = that.fieldsAliasNameArr;
        const filterVal = that.fieldsNameArr;
        const data = that.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "table-" + that.table
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      console.log(this.tableData);
      console.log(filterVal);
      return this.tableData.map(v =>
        filterVal.map(j => {
          if (v[j] != undefined && v[j].toString().length > 200) {
            return "数据太长不显示";
          } else {
            return v[j];
          }

        })
      );
    },
    initData() {
      var that = this;

      that.loading = true;

      var data = {
        u: "gtable",
        table: that.table,
        pagenum: that.currentPage,
        pagesize: that.pageSize,
        // like: that.likeData,
        find: that.findData,
        sort: that.sort
      };
      getList(data)
        .then(response => {
          var { data } = response.data;
          console.log(data);
          if (data == null) {
            this.$message({
              message: '抱歉，您没有查看权限',
              type: 'warning'
            });
            return;
          }

          that.tableData = data.data;
          that.permission = data.permission;

          that.totalNum = data.total;

          var pageSizes = [];

          for (var i = 0; i <= data.total / 50 + 1; i++) {
            pageSizes.push(i * 50);
          }
          pageSizes[0] = 6;

          this.pageSizes = pageSizes;

          var updateFields = {};
          var insertFields = {};
          var findFields = {};
          var sortFields = [];
          for (var key in data.fields) {
            //处理一下 select属性
            if (data.fields[key]["selects"] != null) {
              var selectsData = data.fields[key]["selects"];
              var newSelects = {};
              for (var i = 0; i < selectsData.length; i = i + 2) {
                if (i + 1 < selectsData.length) {
                  newSelects[selectsData[i + 1]] = selectsData[i];
                }
              }
              data.fields[key]["selectArr"] = newSelects;
            }
            if (data.fields[key]["fieldPermission"].indexOf("update") >= 0) {
              updateFields[key] = data.fields[key];
            }
            if (data.fields[key]["fieldPermission"].indexOf("insert") >= 0) {
              data.fields[key]['value'] = "";
              insertFields[key] = data.fields[key];
            }
            if (data.fields[key]["fieldPermission"].indexOf("find") >= 0) {
              findFields[key] = data.fields[key];
            }
            if (data.fields[key]["fieldPermission"].indexOf("sort") >= 0) {
              sortFields.push(key);
            }
          }
          that.insertFields = insertFields;
          that.updateFields = updateFields;
          that.findFields = findFields;
          that.sortFields = sortFields;
          that.fields = data.fields;
          that.defultFields = data.fields;
          that.readyCharts = data.wchart;

          that.loading = false;

          this.$message({
            message: '数据加载成功',
            type: 'success'
          });

        })
        .catch(error => {
          this.$message.error('加载数据出错');
         that.loading = false;
        });
    }
  },
  watch: {
    choiceFields(valArr) {
      var fields = {};
      var fieldsNameArr = [];
      var fieldsAliasNameArr = [];
      for (var key in this.defultFields) {
        if (valArr.indexOf(key) >= 0) {
          fields[key] = this.defultFields[key];
          fieldsNameArr.push(key);
          fieldsAliasNameArr.push(this.defultFields[key]["alias"]);
        }
      }
      this.fields = fields;
      this.fieldsNameArr = fieldsNameArr;
      this.fieldsAliasNameArr = fieldsAliasNameArr;
      // this.fields = this.defultFields.filter(i => valArr.indexOf(i) >= 0)
    },
    buildChartForm: {
      deep: true,
      handler(val) {
        var x = val.x;
        var y = val.y;
        var datarange = val.datarange;
        var xs = [];
        var ys = [];
        var data = this.tableData;

        for (var i = datarange[0]; i < datarange[1]; i++) {
          if (data[i][x] == undefined) {
            return;
          }
          if (data[i][y] == undefined) {
            return;
          }
          xs.push(data[i][x]);
          ys.push(data[i][y]);
        }
        this.chartsData.xdata = xs;
        this.chartsData.ydata = ys;
        this.chartsData.name = this.fields[y]["alias"]
        this.chartsData.xname = this.fields[x]["alias"]
        this.chartsData.yname = this.fields[y]["alias"]
        this.chartsData.title = val.title
      }

    }
  },

};

</script>
<style scoped>
.filter-item {
  margin-bottom: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

</style>
