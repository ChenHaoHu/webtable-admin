<template>
  <div class="app-container">
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

    <el-dialog title="预览" :visible.sync="dialogPreviewVisible">
      <img width="98%;" style=" margin-left:1%; " :src="previewImageUrl" />
    </el-dialog>
  </div>
</template>

<script>
import { getList } from "@/api/table";

export default {
  data() {
    return {
      table: this.$route.name,
      tableData: [],
      choiceFields: [],
      fields: {},
      defultFields: {},
      updateFields:{},
      insertFields:{},
      dialogPreviewVisible: false,
      previewImageUrl:
        "http://p0.qhimg.com/bdm/720_444_0/t01bb9210f980080236.jpg"
    };
  },
  mounted() {
    var that = this;
    var data = {
      u: "gtable",
      table: that.table,
      pagenum: 3,
      pagesize: 8
      // like: {
      //   id: "452760"
      // }
    };
    getList(data)
      .then(response => {
        var { data } = response.data;
        console.log(data);
        that.tableData = data.data;
        that.fields = data.fields;
        that.defultFields = data.fields;
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
  },
  methods: {
    handleClick(row) {
      console.log(row);
    },
    previewImage(data) {
      this.previewImageUrl = data;
      this.dialogPreviewVisible = true;
    }
  },
  watch: {
    choiceFields(valArr) {
      var fields = {};
      for (var key in this.defultFields) {
        if (valArr.indexOf(key) >= 0) {
          fields[key] = this.defultFields[key];
        }
      }
      this.fields = fields;
      // this.fields = this.defultFields.filter(i => valArr.indexOf(i) >= 0)
    }
  }
};
</script>
