<template>
  <div class="welcome">
    <v-alert text color="info" icon="mdi-fire" border="left">
      <h3 class="d-inline">嘿，英雄~ 😻</h3>
      <p class="font-italic ml-4 d-inline">
        调试 API 可以使用
        <span class="font-weight-bold">Postman</span> 或者
        <span class="font-weight-bold">REST Client</span>
        哦~
      </p>
    </v-alert>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>API 指南</v-toolbar-title>
        <v-subheader>
          占位符：{resources} - 集合名, {childResources} - 关联子集合名, {parentResource} - 关联父集合名(单数，不带`s`),
          {dbName} - 数据库名
        </v-subheader>
      </v-toolbar>
      <v-expansion-panels accordion>
        <v-expansion-panel>
          <v-expansion-panel-header>
            常规
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET    /{resources}
    GET    /{resources}/:id
    POST   /{resources}
    PUT    /{resources}/:id
    PATCH  /{resources}/:id
    DELETE /{resources}/:id
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            过滤（Filter）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?key1=value1&key2=value2
    GET /{resources}?id=1&id=2
    GET /{resources}?key.childKey=value
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            分页（Paginate）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?_page=5&_limit=10
    GET /{resources}?_page=5
            </pre>
            <p class="font-italic mt-2">
              默认返回 10 条
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            排序（Sort）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?_sort=key&_order=asc
    GET /{resources}/:id/{childResources}?_sort=key&_order=asc
    GET /{resources}?_sort=key1,key2&_order=desc,asc
            </pre>
            <p class="font-italic mt-2">
              asc - 升序（默认）, desc - 降序
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            切片（Slice）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?_start=20&_end=30
    GET /{resources}/:id/{childResources}?_start=20&_end=30
    GET /{resources}/:id/{childResources}?_start=20&_limit=10
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            操作符（Operators）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?key_gte=10&key_lte=20
    GET /{resources}?id_ne=1
    GET /{resources}?key_like=value （支持正则表达式）
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            全文搜索（Full-text search）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?q=value
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            关联查询（Relationships）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">

    GET /{resources}?_embed={childResources}
    GET /{resources}/1?_embed={childResources}
    GET /{resources}?_expand={parentResource}
    GET /{resources}/1?_expand={parentResource}

    # 范例：
    GET /users?_embed=tasks
    GET /users/1?_embed=tasks
    GET /tasks?_expand=user
    GET /tasks/1?_expand=user
            </pre>
            <p class="font-italic my-2">
              注意：这里的 {parentResource} 是单数，不要带 <span class="pink--text font-weight-bold">`s`</span>，范例：
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            所有数据（All Data）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <pre style="background-color: #f6f8fa;">
    
    GET /{resources}/db
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            文件上传（File Upload）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p class="font-italic my-2">支持多文件上传：最多 <span class="pink--text font-weight-bold">12</span> 个</p>
            <p class="font-italic my-2">请求参数名：<span class="font-weight-bold pink--text">files</span></p>
            <p class="font-italic my-2">
              支持的文件后缀类型：
              <span class="pink--text font-weight-bold">.txt</span>,
              <span class="pink--text font-weight-bold">.md</span>,
              <span class="pink--text font-weight-bold">.xmind</span>,
              <span class="pink--text font-weight-bold">.json</span>,
              <span class="pink--text font-weight-bold">.json5</span>,
              <span class="pink--text font-weight-bold">.xml</span>,
              <span class="pink--text font-weight-bold">.svg</span>,
              <span class="pink--text font-weight-bold">.jpg</span>,
              <span class="pink--text font-weight-bold">.png</span>,
              <span class="pink--text font-weight-bold">.jpeg</span>,
              <span class="pink--text font-weight-bold">.gif</span>,
              <span class="pink--text font-weight-bold">.ppt</span>,
              <span class="pink--text font-weight-bold">.pptx</span>,
              <span class="pink--text font-weight-bold">.doc</span>,
              <span class="pink--text font-weight-bold">.docx</span>,
              <span class="pink--text font-weight-bold">.xls</span>,
              <span class="pink--text font-weight-bold">.xlsx</span>,
              <span class="pink--text font-weight-bold">.pdf</span>,
              <span class="pink--text font-weight-bold">.zip</span>,
              <span class="pink--text font-weight-bold">.tar</span>,
              <span class="pink--text font-weight-bold">.gz</span>,
              <span class="pink--text font-weight-bold">.tar.gz</span>,
              <span class="pink--text font-weight-bold">.7z</span>
            </p>
            <p class="font-italic my-2">REST CLIENT 请求示例：</p>
            <pre style="background-color: #f6f8fa;">
    
    POST /upload
    Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

    ------WebKitFormBoundary7MA4YWxkTrZu0gW
    Content-Disposition: form-data; name="files"; filename="xxx.jpg"
    Content-Type: image/jpeg

    &lt; /path/to/xxx.jpg

    ------WebKitFormBoundary7MA4YWxkTrZu0gW
    Content-Disposition: form-data; name="files"; filename="xxx.png"
    Content-Type: image/png

    &lt; /path/to/xxx.png

    ------WebKitFormBoundary7MA4YWxkTrZu0gW--
            </pre>
            <p class="font-italic my-2">响应数据形如：</p>
            <pre style="background-color: #f6f8fa;">

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
            "destination": "/Users/andremao/git-repository/json-server-ui/server/public/uploads",
            "filename": "20201125-163613-889-274d5e5d-9d64-4d7b-a226-c11a8716cf9b.jpg",
            "path": "/Users/andremao/git-repository/json-server-ui/server/public/uploads/20201125-163613-889-274d5e5d-9d64-4d7b-a226-c11a8716cf9b.jpg",
            "size": 8028,
            "url": "http://localhost:3000/uploads/20201125-163613-889-274d5e5d-9d64-4d7b-a226-c11a8716cf9b.jpg"
          },
          {
            "fieldname": "files",
            "originalname": "xxx.png",
            "encoding": "7bit",
            "mimetype": "image/png",
            "destination": "/Users/andremao/git-repository/json-server-ui/server/public/uploads",
            "filename": "20201125-163613-892-e2362328-23a0-4cbb-ae5a-9856b8659a9b.png",
            "path": "/Users/andremao/git-repository/json-server-ui/server/public/uploads/20201125-163613-892-e2362328-23a0-4cbb-ae5a-9856b8659a9b.png",
            "size": 3222,
            "url": "http://localhost:3000/uploads/20201125-163613-892-e2362328-23a0-4cbb-ae5a-9856b8659a9b.png"
          }
        ]
      }
    }
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            路由映射（Routes Map）
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <span class="d-block my-2"
              >在
              <span style="background-color: #f6f8fa;">/dbs/{dbName}/routes-map.json</span>
              文件中配置，以下为参考：</span
            >
            <pre style="background-color: #f6f8fa;">

    {
      "/users/lastname/:lastname": "/users?name_like=^:lastname",
      "/users/minage/:minage": "/users?age_gte=:minage",
      "/users/lastname/:name/minage/:age": "/users?name_like=^:name&age_gte=:age",

      "/api/*": "/$1",
      "/:resources/:id/show": "/:resources/:id",
      "/posts/:category": "/posts?category=:category",
      "/articles\\?id=:id": "/posts/:id"
    }
            </pre>
            <span class="d-block my-2">现在，你就可以这样访问：</span>
            <pre style="background-color: #f6f8fa;">
    
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
            </pre>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
};
</script>
