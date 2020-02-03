<template>
  <div class="app-container">
       <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    <el-button  :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
    </el-button>
    <br/><br/>
    <el-checkbox-group v-model="choiceFields">
      <el-checkbox :label="index" v-for="(item,index) in defultFields" checked>{{item.alias}}</el-checkbox>
    </el-checkbox-group>
    <br />
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column :prop="index" :label="item.alias" v-for="(item,index) in fields">
        <template slot-scope="scope">
          <div
            v-if="item.webFieldType == 'String'||item.webFieldType == 'Number'"
          >{{scope.row[index]}}</div>
          <!-- <div v-if="item.webFieldType == 'String'"> {{scope.row[index]}}</div> -->
          <img
            height="50px;"
            :src="scope.row[index]"
            v-if="item.webFieldType == 'ImageURL'"
            @click="previewImage(scope.row[index])"
          />
          <img
            height="50px;"
            :src="scope.row[index]"
            v-if="item.webFieldType == 'ImageBASE64'"
            @click="previewImage(scope.row[index])"
          />
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br />
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
       :page-sizes="[6, 10, 100, 200,300,400]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalNum">
    </el-pagination>

    <el-dialog title="Preview" :visible.sync="dialogPreviewVisible">
      <img width="98%;" style=" margin-left:1%; " :src="previewImageUrl" />
    </el-dialog>

    <el-dialog title="Add" :visible.sync="dialogAddVisible">

      <el-form ref="form" :model="addform" label-width="80px">

  <el-form-item :label="item.alias" v-for="(item,index) in  insertFields" >
    <el-input v-model="addform.name" v-if="item.webFieldType == 'String'"></el-input>
    <el-input v-model="addform.name" v-if="item.webFieldType == 'Number'"></el-input>
  </el-form-item>


  <el-form-item>
    <el-button type="primary" @click="onSubmit">Confirm</el-button>
    <el-button>Cancel</el-button>
  </el-form-item>
</el-form>


    </el-dialog>
  </div>
</template>

<script>
import { getList } from "@/api/table";

export default {
  data() {
    return {
      addform:[],
      dialogAddVisible:false,
      totalNum:100,
      pageSize:6,
      currentPage:1,
      downloadLoading: false,
      table: this.$route.name,
      tableData: [],
      choiceFields: [],
      fields: {},
      fieldsNameArr:[],
      fieldsAliasNameArr:[],
      defultFields: {},
      updateFields:{},
      insertFields:{},
      dialogPreviewVisible: false,
      previewImageUrl:
        "http://p0.qhimg.com/bdm/720_444_0/t01bb9210f980080236.jpg"
    };
  },
  mounted() {
      this.initData();
  },
  methods: {
      handleCreate(){
         
      },
     handleSizeChange(val) {
         this.pageSize = val;
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
    handleDownload(){
      this.downloadLoading = true
      var that = this;
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = that.fieldsAliasNameArr
        const filterVal =that.fieldsNameArr
        const data = that.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-'+that.table
        })
        this.downloadLoading = false
      })
    },
     formatJson(filterVal) {
      return this.tableData.map(v => filterVal.map(j => {
        if(v[j].length > 200){
          return "数据太长不显示";
        }else{
          return v[j];
        }
      }))
    },
    initData(){
         var that = this;
    var data = {
      u: "gtable",
      table: that.table,
      pagenum: that.currentPage,
      pagesize: that.pageSize
    //   like: {
    //    // id: "452760"
    //   }
    };
    getList(data)
      .then(response => {
        var { data } = response.data;
        console.log(data);
        that.tableData = data.data;
        that.fields = data.fields;
        that.defultFields = data.fields;
           that.totalNum = data.total
        var updateFields = {};
        var insertFields = {};
        for(var key in data.fields){
          if(data.fields[key]["fieldPermission"].indexOf("update")>=0){
            updateFields[key] = data.fields[key];
          }
          if(data.fields[key]["fieldPermission"].indexOf("insert")>=0){
            insertFields[key] = data.fields[key];
          }
        }
       that.insertFields = insertFields;
       that.updateFields = updateFields;
 
      })
      .catch(error => {
        alert("加载数据出错")
      });
    }
  },
  watch: {
    choiceFields(valArr) {
      var fields = {};
      var fieldsNameArr = []
      var fieldsAliasNameArr = []
      for (var key in this.defultFields) {
        if (valArr.indexOf(key) >= 0) {
          fields[key] = this.defultFields[key];
          fieldsNameArr.push(key)
          fieldsAliasNameArr.push(this.defultFields[key]["alias"])
        }
      }
      this.fields = fields;
      this.fieldsNameArr = fieldsNameArr;
      this.fieldsAliasNameArr = fieldsAliasNameArr;
      // this.fields = this.defultFields.filter(i => valArr.indexOf(i) >= 0)
    }
  }
};
</script>
