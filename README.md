# JSONDBAPI
> 这是一个次奥🐓简单的 [json-server](https://github.com/typicode/json-server) 图形化管理界面，欢迎试用！Star 思密达~ 🙂

## 下载
```
git clone https://github.com/mdmaodun/jsondbapi.git
```

## 安装
```
npm i
```

## 运行
```
npm start
```

## 访问
```
http://localhost:6660
```

## 特性
- 多数据库、集合管理
- API 服务启动、停止
- 端口检查
- 支持中间件拦截
  - 第一步，在 `/dbs/dbName/` 文件夹下添加 `middlewares` 文件夹
  - 第二步，创建一个中间件文件，例如：`sayhi.js`
    ```javascript
    module.exports = (req, res, next) => {
      // method: 请求方法
      // url: 请求地址
      // path: 请求路径，不包括查询参数
      // query: 查询参数
      // body: 请求体数据
      // 注意：params没有，想要 params 路由参数请使用 url-pattern 第三方包解析
      const { method, path, body, query } = req;
      if (method === 'GET' && path === 'sayhi') {
        const { name } = query;
        res.send(`hi~${ name }!`);
        return;
      }
      next();
    }
    ```
  - 第三步，启动（如果事先已经启动，请停止后再启动），即可生效
  - 第四步，访问路径 `/sayhi?name=王二麻子` 即可
