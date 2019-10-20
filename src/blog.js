const fs = require('fs')
const path = require('path')
const md8 = require('md8')
const {layout, fileStat} = require('./lib')

const blog = module.exports = {
  root: process.cwd()
}

blog.setRoot = function (root) {
  blog.root = root
  console.log('blog.root = ', blog.root)
}

blog.filePath = function (file) {
  return path.join(blog.root, decodeURI(file))
}

blog.mdRender = function (ctx, md, mdSide='') { // 呈現 .md 檔案的畫面
  return layout(ctx, md8.toHtml(md), md8.toHtml(mdSide))
}

blog.mdEdit = function (ctx, md) { // 編輯 .md 檔案的畫面
  let body = (ctx.session.userId == null) ? '請先 <a href="/user/login">登入</a> 後才能編輯！': `
  <form id="editForm" action="${ctx.path}?op=save" method="post">
    <textarea name="mdText">${md}</textarea>
    <br/><br/>
    <button>儲存</button>
  </form>
  `
  return layout(ctx, body)
}

blog.viewFile = async function (ctx) {
  let op = ctx.query.op || 'view' // 取得 query 中的 op 參數
  let fpath = blog.filePath(ctx.path)
  console.log('fpath=', fpath)
  let ext = path.extname(ctx.path) // 取得副檔名
  ctx.type = 'text/html'
  switch (op) {
    case 'view': // 顯示檔案
      if (ctx.path.indexOf('.') >= 0) { // 第一種情形：有指定副檔名，那麼直接傳回該檔案串流。
        ctx.type = ext // 設定傳回型態為《副檔名》對應的型態。
        ctx.body = fs.createReadStream(fpath) // 直接傳回該檔案串流
      } else { // 第二種情形：沒有副檔名，那麼預設是要呈現 .md 檔案
        let dir = path.dirname(fpath)
        let sideFile = path.join(dir, '_sidebar.md')
        let sideStat = await fileStat(sideFile)
        let mdSide = ''
        if (sideStat != null) mdSide = await fs.promises.readFile(sideFile, 'utf8')
        let fstat = await fileStat(fpath+'.md')
        if (fstat == null) { // 該 .md 檔案不存在，請使用者編輯！
          ctx.body = blog.mdRender(ctx, `# 檔案不存在\n\n您可以 [創建這個檔案](${ctx.path}?op=edit) !`, mdSide)
        } else { // 該 .md 檔案存在，轉成 html 後呈現
          let md = await fs.promises.readFile(fpath+'.md', 'utf8') // 讀取該 .md 檔案
          ctx.body = blog.mdRender(ctx, md, mdSide) // 將 markdown 轉為 HTML 傳回
        }
      }
      break
    case 'edit': // 編輯檔案
      let fstat = await fileStat(fpath+'.md')
      if (fstat == null) { // 該 .md 檔案不存在，提示編輯框！
        ctx.body = blog.mdEdit(ctx, `# 檔案 ${ctx.path} 不存在\n\n您可以編輯後儲存以創建此檔案！`)
      } else { // 該 .md 檔案不存在，顯示編輯框！
        let md = await fs.promises.readFile(fpath+'.md', 'utf8') // 如果找到該 .md 檔案
        ctx.body = blog.mdEdit(ctx, md); break // 回應編輯畫面  
      }
      break
  }
}

blog.saveFile = async function (ctx) { // 處理 POST 儲存檔案的請求
  let fpath = blog.filePath(ctx.path)
  let mdText = ctx.request.body.mdText // 取得使用者修改過的檔案字串
  await fs.promises.writeFile(fpath+'.md', mdText) // 寫入檔案系統
  ctx.redirect(ctx.path) // 顯示儲存完成後的檔案
}

/*
const MarkdownIt = require('markdown-it')
const mdit = new MarkdownIt({ // 創建 markdown 的轉換物件！
  html: true,
  linkify: true,
  typographer: true
})
*/