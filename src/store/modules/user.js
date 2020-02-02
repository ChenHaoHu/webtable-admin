import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    routers:[]
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROUTERS: (state, routers) => {
    state.routers = routers
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
   
      var data = {
          u:"login",
          username: username.trim(),
          passwd: password 
      }

      login(data).then(response => {

        console.log(response)
        const { data } = response
      
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
     
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      var data = {
        u : "userinfo"
      }
      getInfo(data).then(response => {

        const { data } = response

        var routers = data.data.routers;
        routers = routers.replace(/\ +/g,"")
        routers = routers.replace(/[\r\n]/g,"");
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { name, avatar } = data.data
        commit('SET_ROUTERS', JSON.parse(routers))
        commit('SET_NAME', name)
        commit('SET_AVATAR', "http://blog.hcyang.top/logo.png")
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {

        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')

      // logout(state.token).then(() => {
      //   removeToken() // must remove  token  first
      //   resetRouter()
      //   commit('RESET_STATE')
      //   resolve()
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

