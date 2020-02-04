<template>
  <div class="app-container"  v-if="permission.indexOf('find')>-1">
    <div class="filter-container" v-for="i in searchNum">
      <i class="el-icon-remove-outline" :id="i" @click="deleteSearchNum(i)"></i>
      <el-select v-model="searchType[i]" placeholder="Type" class="filter-item" style="width: 130px">
        <el-option v-for="item in searchTypes" :label="item.name" :value="item.value" />
      </el-select>
      <el-select v-model="searchField[i]" style="width: 140px" class="filter-item">
        <el-option v-for="(item,index) in findFields" :label="item.alias" :value="index" />
      </el-select>
      <el-input v-model="queryText[i]" placeholder="search" style="width: 200px;" class="filter-item" />
    </div>
    <div class="filter-container">
      <i class="el-icon-circle-plus-outline" @click="addSearchNum" v-if="permission.indexOf('find')>-1"></i>
      <el-select v-model="searchType[0]" placeholder="Type" class="filter-item" style="width: 130px" v-if="permission.indexOf('find')>-1">
        <el-option v-for="item in searchTypes" :label="item.name" :value="item.value" />
      </el-select>
      <el-select v-model="searchField[0]" style="width: 140px" class="filter-item" v-if="permission.indexOf('find')>-1">
        <el-option v-for="(item,index) in findFields" :label="item.alias" :value="index" />
      </el-select>
      <el-input v-model="queryText[0]" placeholder="search" style="width: 200px;" class="filter-item" v-if="permission.indexOf('find')>-1" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch" v-if="permission.indexOf('find')>-1">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd" v-if="permission.indexOf('insert')>-1">Add</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">Export</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-refresh-left" @click="refreshData">refresh</el-button>
    </div>
    <el-checkbox-group v-model="choiceFields">
      <el-checkbox :label="index" v-for="(item,index) in defultFields" checked>{{item.alias}}</el-checkbox>
    </el-checkbox-group>
    <br />
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column :prop="index" :label="item.alias" v-for="(item,index) in fields">
        <template slot-scope="scope">
          <div v-if="item.webFieldType == 'String'||item.webFieldType == 'Number'">{{scope.row[index]}}</div>
          <!-- <div v-if="item.webFieldType == 'String'"> {{scope.row[index]}}</div> -->
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
    <el-pagination style="overflow: auto;" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[6, 10, 100, 200,300,400]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalNum"></el-pagination>
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
  </div>
</template>
<script>
import { getList, addItem, deleteItem, updateItem } from "@/api/table";

export default {
  data() {
    return {
      searchNum: 0,
      searchField: [],
      searchType: [],
      searchTypes: [{
        name: "模糊查询",
        value: "like",
      }, {
        name: "精确查询",
        value: "equal",
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
      dialogPreviewVisible: false,
      previewImageUrl: "http://p0.qhimg.com/bdm/720_444_0/t01bb9210f980080236.jpg",
      tempUpdateRow: {},
      likeData: {},
      findData: {}
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
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
      this.findData = {}
      this.likeData = {}
      var searchTypes = this.searchType;
      var searchFields = this.searchField;
      var queryTexts = this.queryText;
      //检验是否都填写
      if (searchTypes.length != 0 && searchTypes.length == searchFields.length && searchTypes.length == queryTexts.length) {

        if(searchTypes.length>1){
           this.$message('重复搜索条件会覆盖(上面会覆盖下面)');
        }

        for (var i = 0; i < searchTypes.length; i++) {
          if (this.searchType[i] == "equal") {
            this.findData[this.searchField[i]] = this.queryText[i]
          } else {
            //like
            this.likeData[this.searchField[i]] = this.queryText[i]
          }
        }

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
    refreshData(){
  this.findData = {}
      this.likeData = {}
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
      return this.tableData.map(v =>
        filterVal.map(j => {
          if (v[j].length > 200) {
            return "数据太长不显示";
          } else {
            return v[j];
          }
        })
      );
    },
    initData() {
      var that = this;
      var data = {
        u: "gtable",
        table: that.table,
        pagenum: that.currentPage,
        pagesize: that.pageSize,
        like: that.likeData,
        find: that.findData
      };
      getList(data)
        .then(response => {
          var { data } = response.data;
          console.log(data);
          that.tableData = data.data;
          that.permission = data.permission;

          that.totalNum = data.total;
          var updateFields = {};
          var insertFields = {};
          var findFields = {};
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
          }
          that.insertFields = insertFields;
          that.updateFields = updateFields;
          that.findFields = findFields;
          that.fields = data.fields;
          that.defultFields = data.fields;
        })
        .catch(error => {
          console.log(error);
          alert("加载数据出错");
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
    }
  }
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
