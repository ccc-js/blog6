const fs = require('fs')

async function fileStat(file) { // 取得檔案狀態 （若不存在傳回 null)
  var fstate = null
  try {
    fstate = await fs.promises.stat(file)
  } catch (error) {}
  return fstate
}

function layout (ctx, body, side='') { // 套用 HTML 樣板 (有 css 與 header 區塊)
  let html = `
<html>
<head>
  <link rel="stylesheet" type="text/css" href="/theme.css">
</head>
<body>
  <header>
    <div>
      <span style="position:fixed; left:10; top:0" >
        <a onclick="toggleSidebar()" style="font-size:32px">≡</a>
      </span>
      <span id="headerTitle"></span>
      <span style="float:right">
        ${ctx.path.startsWith('/blog')&&ctx.query.op!=='edit'&&ctx.session.userId != null ? '<a href="' + ctx.path + '?op=edit">編輯</a>&nbsp;&nbsp;' : ''} 
        ${ctx.path.startsWith('/blog')&&ctx.query.op==='edit' ? '<a href="' + ctx.path + '?op=view">檢視</a>&nbsp;&nbsp;' : ''}
        ${ctx.session.userId == null ? '<a href="/user/login">登入</a>' : '<a href="/user/logout">登出</a>'} &nbsp;&nbsp;
        <a href="/">首頁</a> &nbsp;&nbsp;
        &nbsp;&nbsp;
      </span>
    </div>
  </header>
  <div class="main">
    <aside>
      <div>${side}</div>
    </aside>
    <div class="content">
      ${body}
    </div>
  </div>
  <script src="/fsBlog.js"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
  </script>
</body>
</html>
`
  return html
}

module.exports = {fileStat, layout}
