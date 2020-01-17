/* Layout */
import Layout from "@/layout";
import "nprogress/nprogress.css"; // progress bar style

const getDefaultState = () => {
  var router_default = [
    {
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
      children: [
        {
          path: "dashboard",
          name: "Dashboard",
          component: () => import("@/views/dashboard/index"),
          meta: { title: "Dashboard", icon: "dashboard" }
        }
      ]
    },
    {
      path: "external-link",
      component: Layout,
      children: [
        {
          path: "https://panjiachen.github.io/vue-element-admin-site/#/",
          meta: { title: "External Link", icon: "link" }
        }
      ]
    }

    // 404 page must be placed at the end !!!
    // { path: '*', redirect: '/404', hidden: true }
  ];
  return {
    routers: "",
    addRouters: [],
    router_default:router_default
  };
};

const state = getDefaultState();

const mutations = {
  SET_ROUTERS: (state, routers) => {
    state.addRouters = routers;
    state.routers = state.router_default.concat(routers);
  }
};

const actions = {
  GenerateRoutes({ commit }) {
    return new Promise(resolve => {
      var asyncRouterMap = [
        {
          path: "/example",
          component: Layout,
          redirect: "/example/table",
          name: "Example",
          meta: { title: "Example", icon: "example" },
          children: [
            {
              path: "table",
              name: "Table",
              component: () => import("@/views/table/index"),
              meta: { title: "Table", icon: "table" }
            },
            {
              path: "tree",
              name: "Tree",
              component: () => import("@/views/tree/index"),
              meta: { title: "Tree", icon: "tree" }
            }
          ]
        },

        {
          path: "/form",
          component: Layout,
          children: [
            {
              path: "index",
              name: "Form",
              component: () => import("@/views/form/index"),
              meta: { title: "Form", icon: "form" }
            }
          ]
        },

        {
          path: "/nested",
          component: Layout,
          redirect: "/nested/menu1",
          name: "Nested",
          meta: {
            title: "Nested",
            icon: "nested"
          },
          children: [
            {
              path: "menu1",
              component: () => import("@/views/nested/menu1/index"), // Parent router-view
              name: "Menu1",
              meta: { title: "Menu1" },
              children: [
                {
                  path: "menu1-1",
                  component: () => import("@/views/nested/menu1/menu1-1"),
                  name: "Menu1-1",
                  meta: { title: "Menu1-1" }
                },
                {
                  path: "menu1-2",
                  component: () => import("@/views/nested/menu1/menu1-2"),
                  name: "Menu1-2",
                  meta: { title: "Menu1-2" },
                  children: [
                    {
                      path: "menu1-2-1",
                      component: () =>
                        import("@/views/nested/menu1/menu1-2/menu1-2-1"),
                      name: "Menu1-2-1",
                      meta: { title: "Menu1-2-1" }
                    },
                    {
                      path: "menu1-2-2",
                      component: () =>
                        import("@/views/nested/menu1/menu1-2/menu1-2-2"),
                      name: "Menu1-2-2",
                      meta: { title: "Menu1-2-2" }
                    }
                  ]
                },
                {
                  path: "menu1-3",
                  component: () => import("@/views/nested/menu1/menu1-3"),
                  name: "Menu1-3",
                  meta: { title: "Menu1-3" }
                }
              ]
            },
            {
              path: "menu2",
              component: () => import("@/views/nested/menu2/index"),
              meta: { title: "menu2" }
            }
          ]
        },
        { path: "*", redirect: "/404", hidden: true }
      ];

      const accessedRouters = asyncRouterMap; //asyncRouterMap 自己从后端获取校验过后的
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
