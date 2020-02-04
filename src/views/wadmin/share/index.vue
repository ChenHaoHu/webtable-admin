<template>
  <div class="app-container">
    <el-button type="primary" @click="addShare">添加分享</el-button>
    <br />
    <br />
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="username" label="Share Key">
      </el-table-column>
      <el-table-column prop="passwd" label="Share Passwd">
      </el-table-column>
      <el-table-column prop="marks" label="备注">
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          <el-tooltip content="更改分享状态">
            <el-switch @change="changeStatus(scope.row)" v-model="scope.row['status']" active-color="#13ce66" inactive-color="#ff4949" active-value="1" inactive-value="0">
            </el-switch>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button @click="handlePermission(scope.row)" type="text" size="small">查看授权</el-button>
          <el-button @click="handleDelete(scope.row)" type="text" size="small">删除分享</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="查看授权" :visible.sync="dialogPermissionVisible">
      <el-form label-width="80px">
        <el-form-item label="分享备注">
          <el-input v-model="shareMarks"></el-input>
        </el-form-item>
        <el-form-item label="权限树">
          <el-tree :data="treeData" show-checkbox node-key="id" ref="dataUpdateTree">
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPermissionVisible = false">取 消</el-button>
        <el-button type="primary" @click="updatePermission">更 新</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加分享" :visible.sync="dialogAddPermissionVisible">
      <el-form label-width="80px">
        <el-form-item label="分享备注">
          <el-input v-model="shareMarks"></el-input>
        </el-form-item>
        <el-form-item label="权限树">
          <el-tree :data="treeData" show-checkbox node-key="id" ref="dataAddTree">
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddPermissionVisible = false">取 消</el-button>
        <el-button type="primary" @click="hanlderAddShareItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { gsharepermissionlist, addshare, getshare, updateshare, deleteshare } from "@/api/wadmin";
export default {
  data() {
    return {
      shareMarks: "",
      dialogAddPermissionVisible: false,
      dialogPermissionVisible: false,
      choose: "",
      treeData: [],
      tableData: [{
        key: "1111",
        passwd: "2222",
        marks: "测试分享内容",
        status: "1"
      }],
      tempRow: {}

    };
  },
  mounted() {
    this.initListData();
    this.initTreeData();
  },

  methods: {
    changeStatus(row) {
      var that = this;
      var data = {
        u: "ushare",
        username: row.username,
        marks: row.marks,
        permission: row.permission,
        status: row.status
      };
      updateshare(data)
        .then(response => {
          if (response.code == 1017) {
            this.$message({
              message: '更新分享成功',
              type: 'success'
            });
            this.dialogPermissionVisible = false;
            this.shareMarks = "";
            this.initListData();
          }
        }).catch(error => {
          console.log(error);
          alert("加载数据出错");
        });
    },
    handleDelete(row) {

      this.$confirm('此操作将永久删除该分享, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var data = {
          u: "dshare",
          username: row.username
        };
        deleteshare(data)
          .then(response => {
            if (response.code == 1021) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
              this.initListData();
            }
          }).catch(error => {
            console.log(error);
            alert("加载数据出错");
          });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });


    },
    hanlderAddShareItem() {
      if (this.shareMarks == "") {
        this.$message.error('备注不能为空');
      } else {
        var that = this;
        var data = {
          u: "ashare",
          marks: this.shareMarks,
          permission: this.getKeys("dataAddTree")
        };
        addshare(data)
          .then(response => {
            if (response.code == 1019) {
              this.$message({
                message: '添加分享成功',
                type: 'success'
              });
              this.dialogAddPermissionVisible = false;
              this.shareMarks = "";
              this.initListData();
            }
          }).catch(error => {
            console.log(error);
            alert("加载数据出错");
          });
      }

    },
    addShare() {
      this.dialogAddPermissionVisible = true;
      this.shareMarks = "";
      setTimeout(
        () => {
          this.$refs.dataAddTree.setCheckedKeys([])
        }, 200
      );
    },

    updatePermission() {

      if (this.shareMarks == "") {
        this.$message.error('备注不能为空');
      } else {
        var that = this;
        var data = {
          u: "ushare",
          username: this.tempRow.username,
          marks: this.shareMarks,
          permission: this.getKeys("dataUpdateTree"),
          status: this.tempRow.status
        };
        updateshare(data)
          .then(response => {
            if (response.code == 1017) {
              this.$message({
                message: '更新分享成功',
                type: 'success'
              });
              this.dialogPermissionVisible = false;
              this.shareMarks = "";
              this.initListData();
            }
          }).catch(error => {
            console.log(error);
            alert("加载数据出错");
          });
      }



    },
    handlePermission(row) {
      this.dialogPermissionVisible = true;
      this.tempRow = row;
      var permission = row.permission.filter(function(ele) {

        if (ele.indexOf("permission.") > -1 || ele.indexOf("fields.") > -1) {
          return ele;
        }
      });
      this.shareMarks = row.marks;
      setTimeout(
        () => {
          this.$refs.dataUpdateTree.setCheckedKeys(permission)
        }, 200
      );
    },
    getKeys(key) {
      var aKey = this.getCheckedKeys(this.treeData, this.$refs[key].getCheckedKeys(), 'id');
      return aKey;
    },
    getCheckedKeys(data, keys, key) {
      var res = [];
      recursion(data, false);
      return res;

      function recursion(arr, isChild) {
        var aCheck = [];
        for (var i = 0; i < arr.length; i++) {
          var obj = arr[i];
          aCheck[i] = false;

          if (obj.children) {
            aCheck[i] = recursion(obj.children, true) ? true : aCheck[i];
            if (aCheck[i]) {
              res.push(obj[key]);
            }
          }

          for (var j = 0; j < keys.length; j++) {
            if (obj[key] == keys[j]) {
              aCheck[i] = true;
              if (res.indexOf(obj[key]) == -1) {
                res.push(obj[key]);
              }
              break;
            }
          }
        }
        if (isChild) {
          return aCheck.indexOf(true) != -1;
        }
      }
    },
    initTreeData() {
      var that = this;
      var data = {
        u: "gsharepermissionlist",
      };
      gsharepermissionlist(data)
        .then(response => {
          var { data } = response;

          var res = data.data;
          var list = []
          for (var table in res) {

            var permissions = [];
            for (var i = 0; i < res[table]["permission"].length; i++) {
              permissions.push({
                id: "permission." + table + "." + res[table]["permission"][i],
                label: res[table]["permission"][i],
              })
            }

            var fields = [];
            for (var field in res[table]["fields"]) {
              fields.push({
                id: "fields." + table + "." + field,
                label: res[table]["fields"][field],
              })
            }

            var tableChildren = [];
            tableChildren.push({
              id: table + "permission",
              label: "表权限",
              children: permissions
            })

            tableChildren.push({
              id: table + "fields",
              label: "字段",
              children: fields
            })

            list.push({
              id: table,
              label: res[table]['alias'],
              children: tableChildren
            })

          }
          that.treeData = list;
        }).catch(error => {
          console.log(error);
          alert("加载数据出错");
        });
    },
    initListData() {

      var data = {
        u: "gshare",

      };
      getshare(data)
        .then(response => {
          if (response.code == 1000) {
            this.tableData = response.data.data
          }
        }).catch(error => {
          console.log(error);
          alert("加载数据出错");
        });
    }
  }
};

</script>
<style scoped>
.line {
  text-align: center;
}

</style>
