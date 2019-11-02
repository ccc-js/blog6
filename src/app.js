#!/usr/bin/env node
const fs = require('fs')
const https = require('https')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaLogger = require('koa-logger')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const session = require('koa-session')
const path = require('path')
const argv = require('yargs').argv
const blog = require('./blog')
const user = require('./user')

const app = module.exports = new Koa()
const router = new KoaRouter()

router
.get('/', async (ctx) => {
  ctx.redirect('/blog/Home')
})
.get('/blog/(.*)', blog.viewFile)
.post('/blog/(.*)', blog.saveFile)
.get('/user/login', user.pageLogin)
.post('/user/login', user.login)
.get('/user/logout', user.logout)

app.use(koaStatic(path.join(__dirname, '../public')))
app.use(koaLogger()) // 使用 koa-logger 紀錄那些網址曾經被訪問過
app.use(koaBody({ jsonLimit: '1kb' })) // 使用 koa-body 自動將 POST 訊息轉為物件方便存取。

app.keys = ['*@&))9kdjafda;983'] // app 的密鑰 => koa-session 會用到
const CONFIG = { // session 的密鑰與設定
  key: 'd**@&(_034k3q3&@^(!$!',
  maxAge: 86400000
}

app.use(session(CONFIG, app)) // 啟動 koa-session 功能
app.use(router.routes()) // 使用 koa-router 路由
app.blog = blog
blog.setRoot(argv.root || process.cwd())

// http server
blog.port = argv.port || 80
user.load(path.join(blog.root, 'users.json'))
app.listen(blog.port) // 啟動 Server

// SSL server (https)
const options = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.crt'))
}
blog.portSsl = argv.portssl || 443
https.createServer(options, app.callback()).listen(blog.portSsl)

console.log(`
Blog6 host at http://localhost:${blog.port}
      ssl  at https://localhost:${blog.portSsl}
      root = ${blog.root}
`)

