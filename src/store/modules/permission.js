/* Layout */
import Layout from "@/layout";
import "nprogress/nprogress.css"; // progress bar style
import store from "../../store";
const getDefaultState = () => {
  var router_default = [{
      path: "/login",
      component: () => import("@/views/login/index"),
      hidden: true
    },
    {
      path: "/404",
      component: () => import("@/views/404"),
      hidden: true
    },

    {
      path: "/",
      component: Layout,
      redirect: "/dashboard",
      children: [{
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: {
          title: "Dashboard",
          icon: "dashboard"
        }
      }]
    },
    // {
    //   path: "external-link",
    //   component: Layout,
    //   children: [
    //     {
    //       path: "https://panjiachen.github.io/vue-element-admin-site/#/",
    //       meta: { title: "External Link", icon: "link" }
    //     },{
    //       path: "https://panjiachen.github.io/vue-element-admin-site/#/",
    //       meta: { title: "External Link", icon: "link" }
    //     }
    //   ]
    // }

    // 404 page must be placed at the end !!!
    // { path: '*', redirect: '/404', hidden: true }
  ];
  return {
    routers: "",
    addRouters: [],
    router_default: router_default,
    status :0
  };
};

const state = getDefaultState();

const mutations = {
  SET_ROUTERS: (state, routers) => {

    if(state.status == 0){
      state.addRouters = routers;
      state.status = 1;
    }else{
      state.addRouters = [];
    }
   
    state.routers = state.router_default.concat(routers);
  }
};

const actions = {
  GenerateRoutes({
    commit
  }) {
    return new Promise(resolve => {
      // var asyncRouterMap = [{
      //     path: "/form1",
      //     component: Layout,
      //     children: [{
      //       path: "index",
      //       name: "Form",
      //       component: () => import("@/views/form/index"),
      //       meta: {
      //         title: "Form1",
      //         icon: "form"
      //       }
      //     }]
      //   },
      //   {
      //     path: "/form2",
      //     component: Layout,
      //     children: [{
      //       path: "index",
      //       name: "Form",
      //       component: () => import("@/views/form/index"),
      //       meta: {
      //         title: "Form2",
      //         icon: "form"
      //       }
      //     }]
      //   },
      //   {
      //     path: "/wadmin",
      //     component: Layout,
      //     redirect: "/example/table",
      //     name: "Example",
      //     meta: {
      //       title: "wadmin",
      //       icon: "example"
      //     },
      //     children: [{
      //         path: "table",
      //         name: "Table",
      //         component: () => import("@/views/table/index"),
      //         meta: {
      //           title: "权限管理",
      //           icon: "table"
      //         }
      //       },
      //       {
      //         path: "tree",
      //         name: "Tree",
      //         component: () => import("@/views/tree/index"),
      //         meta: {
      //           title: "分享管理",
      //           icon: "tree"
      //         }
      //       }
      //     ]
      //   },
      //   {
      //     path: "*",
      //     redirect: "/404",
      //     hidden: true
      //   }
      // ];

      var map = {
       "/table/index":() => import("@/views/table/index"),
       "/wadmin/permission/index":() => import("@/views/wadmin/permission/index"),
       "/wadmin/member/index":() => import("@/views/wadmin/member/index"),
       "/wadmin/share/index":() => import("@/views/wadmin/share/index"),
      }

      var routerss = store.getters.userRouters;
      for (var i = 0; i < routerss.length - 1; i++) {
        routerss[i]["component"] = Layout;
        var childerns = routerss[i]["children"];
        for (var j = 0; j < childerns.length; j++) {
          var viewPath = childerns[j]["component"];
          childerns[j].component = map[viewPath]
        }
      }

      const accessedRouters = routerss; //asyncRouterMap 自己从后端获取校验过后的
      commit("SET_ROUTERS", accessedRouters);
      resolve();
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
