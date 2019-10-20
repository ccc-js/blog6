const fs = require('fs')
const {layout} = require('./lib')
const user = module.exports = {}

user.map = { // 預設的使用者帳號密碼
  'ccc': {password: '123'},
  'snoopy': {password: '456'}
}

user.load = function (jsonFile) {
  let json = fs.readFileSync(jsonFile, 'utf8')
  user.map = JSON.parse(json)
  console.log('user.map=', user.map)
}

user.pageLogin = function (ctx) { // 顯示登入畫面
  let msg = ctx.session.msg || ''
  ctx.body = layout(ctx, `
    <form action="/user/login" method="post">
      <p style="color:red">${msg}</p>
      <p>
        <label>帳號</label><br/>
        <input name="id" type="text" value="">
      </p>
      <p>
        <label>密碼</label><br/>
        <input name="password" type="password" value="">
      </p>
      <button>登入</button>
    </form>
  `)
  ctx.session.msg = ''
}

user.login = async function (ctx) { // 登入檢查
  let {id, password} = ctx.request.body // 取得使用者輸入的帳號密碼
  let user1 = user.map[id] // 取得 id 對應的使用者
  if (user1 != null && user1.password == password) { // 如果該使用者存在且密碼正確，則登入成功
    ctx.session.userId = id // 用 session 記住這個使用者帳號
    ctx.redirect('/') // 導回首頁
  } else {
    ctx.session.msg = '登入失敗，請重新輸入!'
    ctx.redirect('/user/login') // 導回登入畫面並顯示錯誤訊息！
  }
}

user.logout = async function (ctx) { // 登出
  ctx.session.userId = undefined // 從 session 中刪除該使用者 (強迫忘記該使用者)
  ctx.redirect('/user/login') // 回到登入畫面
}
