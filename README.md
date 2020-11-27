# JSON-SERVER-UI
> 这是一个次奥🐓简单的 [JSON-SERVER](https://github.com/typicode/json-server) 图形化管理界面，欢迎试用！Star 思密达~ 🙂

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
- 简单操作即可拥有强大的 REST API 服务

- 多库、多集合管理

- 增量导入，支持 [MockJS](http://mockjs.com/) 语法

- 独立进程启动&停止服务，启动端口预检

- 多文件上传

  支持多文件上传：最多 **12** 个

  请求参数名：**files**

  支持的文件后缀类型：**.txt**, **.md**, **.xmind**, **.json**, **.json5**, **.xml**, **.svg**,  **.jpg**, **.png**, **.jpeg**, **.gif**,  **.ppt**, **.pptx**, **.doc**, **.docx**, **.xls**, **.xlsx**, **.pdf**, **.zip**, **.tar**, **.gz**, **.tar.gz**, **.7z**

  REST CLIENT 请求示例：

  ```
  POST /upload
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
  
  ------WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="files"; filename="xxx.jpg"
  Content-Type: image/jpeg
  
  < /path/to/xxx.jpg
  
  ------WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="files"; filename="xxx.png"
  Content-Type: image/png
  
  < /path/to/xxx.png
  
  ------WebKitFormBoundary7MA4YWxkTrZu0gW--
  ```

  响应数据形如：

  ```json
  {
    "code": 200,
    "msg": "ok.",
    "data": {
      "files": [
        {
          "fieldname": "files",
          "originalname": "xxx.jpg",
          "encoding": "7bit",
          "mimetype": "image/jpeg",
          "destination": "/Users/mdmaodun/git-repository/json-server-ui/server/public/uploads",
          "filename": "20201125-163613-889-274d5e5d-9d64-4d7b-a226-c11a8716cf9b.jpg",
          "path": "/Users/mdmaodun/git-repository/json-server-ui/server/public/uploads/20201125-163613-889-274d5e5d-9d64-4d7b-a226-c11a8716cf9b.jpg",
          "size": 8028,
          "url": "http://localhost:3000/uploads/20201125-163613-889-274d5e5d-9d64-4d7b-a226-c11a8716cf9b.jpg"
        },
        {
          "fieldname": "files",
          "originalname": "xxx.png",
          "encoding": "7bit",
          "mimetype": "image/png",
          "destination": "/Users/mdmaodun/git-repository/json-server-ui/server/public/uploads",
          "filename": "20201125-163613-892-e2362328-23a0-4cbb-ae5a-9856b8659a9b.png",
          "path": "/Users/mdmaodun/git-repository/json-server-ui/server/public/uploads/20201125-163613-892-e2362328-23a0-4cbb-ae5a-9856b8659a9b.png",
          "size": 3222,
          "url": "http://localhost:3000/uploads/20201125-163613-892-e2362328-23a0-4cbb-ae5a-9856b8659a9b.png"
        }
      ]
    }
  }
  ```

- 路由映射

  在 `/dbs/{dbName}/routes-map.json` 文件中添加映射关系，比如：

  ```json
  {
    "/users/lastname/:lastname": "/users?name_like=^:lastname",
    "/users/minage/:minage": "/users?age_gte=:minage",
    "/users/lastname/:name/minage/:age": "/users?name_like=^:name&age_gte=:age",
    
    "/api/*": "/$1",
    "/:resource/:id/show": "/:resource/:id",
    "/posts/:category": "/posts?category=:category",
    "/articles\\?id=:id": "/posts/:id"
  }
  ```

  现在，你就可以这样访问：

  ```
  # 获取姓张的所有用户
  /users/lastname/张 # → /users?name_like=^张
  
  # 获取大于等于18岁的所有用户
  /users/minage/18 # → /users?age_gte=18
  
  # 获取姓张并且大于等于18岁的所有用户
  /users/lastname/张/minage/18 # → /users?name_like=^张&age_gte=18
  
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
  
  

