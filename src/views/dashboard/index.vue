<template>
  <div class="dashboard-container">
    <div class="dashboard-text">你好啊, {{name}}
      <br>
      <h5> web Table 项目正在开发ing</h5>
      <hr>
      <h6>2020/02/10 添加多种查询条件，添加本地/远程排序功能</h6>
      <h6>2020/02/09 添加本地可视化编辑功能</h6>
      <h6>2020/02/05 完成分享模块管理，修复中文提交bug</h6>
      <h6>2020/02/04 完成前端表权限，CRUD开发</h6>
      <h6>2020/02/03 前后端第一阶段联调，跑通基本数据，动态路由成功实现</h6>
      <h6>2020/02/02 模板二次优化，动态路由开发，基本组件设计</h6>
      <h6>2020/02/01 前端项目启动</h6>
      <br>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
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

</style>
