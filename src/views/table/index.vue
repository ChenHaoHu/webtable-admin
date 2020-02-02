<template>
  <div class="app-container">
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column :prop="index" :label="item.alias" v-for="(item,index) in fields" >
        <template slot-scope="scope">
          <div v-if="item.webFieldType == 'String'||item.webFieldType == 'Number'"> {{scope.row[index]}}</div>
           <!-- <div v-if="item.webFieldType == 'String'"> {{scope.row[index]}}</div> -->
          <img   height=50px; :src="scope.row[index]" v-if="item.webFieldType == 'ImageURL'"  @click='previewImage(scope.row[index],"url")' />
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="预览" :visible.sync="dialogPreviewVisible" >
      <img  width=98%; style=" margin-left:1%; "  :src="previewImageUrl">
    </el-dialog>
  </div>
</template>

<script>
import { getList } from "@/api/table";

export default {
  data() {
    return {
      table: this.$route.name,
      tableData: [
      ],
      fields:[],
      dialogPreviewVisible:false,
      previewImageUrl:"http://p0.qhimg.com/bdm/720_444_0/t01bb9210f980080236.jpg"
    };
  },
  mounted() {
    var that = this;
    var data = {
      u: "gtable",
      table: that.table,
      pagenum: 3,
      pagesize: 8,
      // like: {
      //   id: "452760"
      // }
    };
    getList(data)
      .then(response => {

      var  {data} = response.data
        console.log(data);
        that.tableData = data.data;
        that.fields = data.fields
      })
      .catch(error => {});
  },
  methods: {
    handleClick(row) {
      console.log(row);
    },
    previewImage(data,type){
      this.previewImageUrl = data;
      this.dialogPreviewVisible =true;
    }
  }
};
</script>
