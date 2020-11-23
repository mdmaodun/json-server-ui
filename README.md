# json-server-ui
> 这是一个次奥🐓简单的 [json-server](https://github.com/typicode/json-server) 图形化管理界面，欢迎试用！Star 思密达~ 🙂

## 下载

进入一个合适的目录，执行：

```
git clone https://github.com/mdmaodun/json-server-ui.git
```

## 安装依赖

```
cd json-server-ui && npm i
```

## 运行
```
npm start
```

## 访问
```
http://localhost:5000
```

## 特性
- 在界面上点一点，即可拥有强大的 API 服务

- 多库、多集合管理

- 独立进程启动、停止 API 服务

- 多操作系统兼容（MacOS、Windows、Linux）

- 启动端口检查

- 路由映射

  在 `/dbs/{dbName}/routes-map.json` 文件中添加映射关系，比如：

  ```json
  {
    "/hehe": "/users?name_like=^张",
    "/api/*": "/$1",
    "/:resource/:id/show": "/:resource/:id",
    "/posts/:category": "/posts?category=:category",
    "/articles\\?id=:id": "/posts/:id"
  }
  ```

  现在，你就可以这样访问：

  ```
  /hehe # → /users?name_like=^张
  /api/posts # → /posts
  /api/posts/1  # → /posts/1
  /posts/1/show # → /posts/1
  /posts/javascript # → /posts?category=javascript
  /articles?id=1 # → /posts/1
  ```

- 中间件拦截，详细步骤如下：

  第一步，在 `/dbs/{dbName}/middlewares/` 文件夹下添加一个 `*.js` 文件，例如：`sayHi.js`

  ```javascript
  const { join } = require('path');
  const getdb = require('../../../server/utils/getdb');
  // db: lowdb实例对象
  const db = getdb(join(__dirname, '../db.json'));
  
  module.exports = (req, res, next) => {
    // method: 请求方法
    // url: 请求地址
    // path: 请求路径，不包括查询参数
    // query: 查询参数
    // body: 请求体数据
    // 注意：params没有，想要 params 路由参数请使用 url-pattern 第三方包解析
    const { method, url, path, query, body } = req;
    if (method === 'GET' && path === '/sayHi') {
      const { name } = query;
  
      // 根据 name 查找用户
      const user = db
        .read()
        .get('users')
        .find({ name })
        .value();
  
      res.json({
        code: 200,
        msg: `Hi~ ${name}!`,
        data: user,
      });
      return;
    }
    next();
  };
  
  ```
  
  第二步，启动（**如果事先已经启动，请停止后再启动**），即可自动识别生效
  
  第三步，访问路径：`/sayHi?name=王二麻子` 
  
  