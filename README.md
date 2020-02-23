# 从零搭建 Webpack/React/Tailwindcss 项目

随着前端框架的发展，`vue-cli` 和 `create-react-app` 可以一键生成基础项目模板。但是对于新手来讲，跳过了很多细节。现在让我们从一个空文件夹开始，一步一步搭建起使用 Webpack 、React 和 Tailwindcss 框架的基础项目。在这个过程中，说明每个工具的作用，加深对现代前端工具链的理解。

## 一、准备

- 具备 JS、CSS 基础
- 了解打包概念
- `npm` 或者 `yarn` 包管理工具，这里使用的是 `yarn`

## 二、使用 Webpack

webpack 可以对  js 、css 等资源文件进行打包，先不考虑打包复杂资源和框架，我们从最基础的 js和 css 开始打包。

### 2.1 开始一个新项目

- 首先创建一个空文件夹，使用 `yarn init `来初始化一个 `package.json` , 使用 `git init` 初始化 `git`

- 创建 `src` 文件夹，然后在此文件夹加入 `index.html`、` index.js` 和 `index.css`

index.js

```javascript
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('content').innerText = 'Content from JS';
})
```

index.css

```css
body {
  text-align: center;
}

.content {
    color: blueviolet;
}
```

html

```html
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React with Tailwindcss</title>
  	<link rel="stylesheet" href="./index.css">
  	<script src="./index.js"></script>
</head>
<body>
  <h1>HELLO WORLD!</h1>
  <div id="content" class="content"></div>
</body>
</html>
```

浏览器打开 `index.html`，最基础的模板就已经完成。 下一步使用 Webpack 打包 index.js  和  index.css。

### 2.2 Webpack 打包 JS

安装 webpack，为了可以使用webpack命令行，需要同时安装 `webpack-cli`

```bash
yarn add webpack webpack-cli -D
```

> TIP: 调整 `package.json` 文件，确保我们安装包是`私有的(private)`，并且移除 `main` 入口。这可以防止意外发布你的代码。

先试一下零配置运行 webpack. 零配置情况下，webpack会以`./src/index.js` 为 `entry`。

执行 `./node-modules/.bin/webpack`，执行成功后，会生成一个  `dist` 文件夹，文件夹中有 `main.js` ，这个是 webpack 默认的 `output`。现在修改 `index.html` 

```html
// 改为
<script src="../dist/index.js"></script>
```

刷新页面就可以看到效果和原来的一样。 我们就已经成功使用 webpack 打包 js 了。 

在 `package.json` 中加入`scripts`， 后面可以使用 `yarn build` 来替代`./node-modules/.bin/webpack`

package.json

```json
"version": "1.0.0",
...
"scripts": {
	"build": "webpack"
}
...
```

为了方便更高级的配置，在文件夹`根目录`建立 `webpack.config.js `，`output` 里的 `path` 必须是绝对路径，所以需要用到 path 库。

```js
const path = require('path');
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
}
```

### 2.3 Webpack 打包 CSS

打包 css 需要用到 `css-loader` 和 `style-loader`  来处理css文件。 先装上，再介绍它们的作用。 

```shell
yarn add css-loader style-loader -D 
```

`css-loader` 用来处理css文件，`webpack` 本身只支持js打包，其他的文件需要用` loader` 来完成。用了`css-loader` 就可以正常的把 `css` 打包进` js `文件中。对的 `css-loader` 只负责识别 `css` 并打包进 `js`，当然在 `js` 中的 `css` 是无法生效的。这时候 `style-loader` 就派上用场了，它会将 `js`中的 `css` 以内联样式，即在 `header` 中插入 `<style>`的方式注入到 `html`，这样css就生效了。修改 `webpack.config.js` 如下:

```js
const path = require('path');
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }
}
```

这里需要注意，`style-loader` 和 `css-loader` 顺序不能错，` loader` 传递顺序是从后向前。意思是代码首先通过 `css-loader`， 然后再通过 `style-loader`。 关于 `loader` 的使用方法，请查看webpack 官方文档。

执行 `yarn build` 后， 修改 `index.html` 把 `<link rel="stylesheet" href="./index.css">` 去掉，因为 css 已经在 js中，不需要再加载。 后面会讲到如何把css进行分离和压缩。

## 三、引入 Tailwindcss

在引入 `tailwindcss` 之前，首先要介绍一下 `PostCSS`。 `PostCSS` 并不是一个对 css 进行压缩或者添加前缀的工具。 `PostCSS` 只做一个特别简单的事情，就是把 css 解析成语法树（Abstract Syntax Tree，AST），并提供操纵语法树的接口，随后在将语法树输出成字符串。这样一来就可以方便的对css进行修改，比如添加前缀 `autoprefix` 等等。 添加前缀等功能是 `PostCSS` 的一个插件。所以当我们说到 `PostCSS`，更多的是讲到 `PostCSS` 一个插件系统。 `tailwindcss` 同样提供`PostCSS`的插件，这样一来就可以使用 `tailwindcss` 自带的语法`@tailwindcss` `@apply`等。`postcss-loader` 是`PostCSS`在 webpack 上的一个插件，用来webpack调用`PostCSS`。

首先安装 `tailwindcss` 、`postcss-loader`

```shell
yarn add tailwindcss postcss-loader -D
```

然后修改index.css, 引入tailwindcss组件

```css
@tailwind base;

@tailwind components;

@tailwind utilities;
```

这里 `@tailwind` 是 `tailwindcss`的语法糖， 不是 css 语法，所以 `css-loader`并不能直接解析它。正确流程是通过 `PostCSS`的 `tailwindcss` 插件处理好以后，再传给 `css-loader`，所以 `loader`配置如下

```js
...
module: {
    rules: [
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
                {
                	loader: 'postcss-loader',
                	options: {
                		ident: 'postcss',
                		plugins: [
                			require('tailwindcss')
                		]
                	}
                }
            ]
        }
    ]
}
...
```

> TIP: webpack requires an identifier (`ident`) in `options` when `{Function}/require` is used (Complex Options). The `ident` can be freely named as long as it is unique. It's recommended to name it (`ident: 'postcss'`)

复制 `tailwincss`  官网示例html代码到 `index.html` ，`yarn build` 以后刷新页面查看效果， 如果显示正常说明已经成功的引入 `tailwindcss`。

## 四、优化 CSS

### 3.1将css独立成文件

目前为止，所有的 css 还在 js 中，如果我们想把 css 独立出来，不再通过 `style-loader`  插入到 `header` 中，那么将会用到webpack 插件[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

```shell
yarn add mini-css-extract-plugin -D
```

用了这个插件以后，就不用在用 style-loader 了。

修改 `webpack.config.js`

```js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                require('tailwindcss')
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

这样就会将css提取到 `dist/css/`文件夹下面。更多详细配置请参考官方文档。

### 3.2 自动插入 HTML

在上一步的过程中，我们生成的 css 文件名称你会发现后面多了一个随机的 `hash`值。 这个是为了避免缓存。每次生成的 `hash`值将会不一样，那么我们再引入html的时候就需要不断的修改。为了解决这个问题，引入插件 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)。这个插件可以把编译好的资源自动插入到html中。

```shell
yarn add html-webpack-plugin@next -D
```

在 `webpack.config.js` 中配置

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
   
...
plugins: [
   ...,
   new HtmlWebpackPlugin({
     template: './index.html',
  }),
]
...
```

### 3.3 压缩 CSS 文件

`Tailwindcss` 由于包含很多工具，所以 css 体积会比较大。打包以后 `main.css` 有 700+KB， 这里引入` PurgeCSS` 进行压缩

```shell
yarn add @fullhuman/postcss-purgecss -D
```

通过名称可以看出，他是一个 `PostCSS` 插件。随着 `PostCSS`插件变多，我们将 `PostCSS` 的设置独立出来，新建 `postcss.config.js`

```js
const PurgeCss = require('@fullhuman/postcss-purgecss');
const PurgeOptions = {

    // Specify the paths to all of the template files in your project 
    content: [
      './src/**/*.html',
      './src/**/*.vue',
      './src/**/*.jsx',
      // etc.
    ],
  
    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
};

module.exports = {
    plugins: [
        require('tailwindcss'),
        PurgeCss(PurgeOptions),
    ],
}
```

在 `webpack.config.js` 中，把 `loaders` 改为

```js
...
module: {
    rules: [
        {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
            ]
        }
    ]
}
...
```

再次打包，就会发现 `main.css` 小了很多。至此 `tailwindcss` 打包完成。

## 五、引入 React

在使用 `React` 之前需要先安装一个编译器 `Babel`。它能让你编写的新版本 JavaScript 代码，在旧版浏览器中依然能够工作。

```shell
yarn add @babel/core @babel/cli @babel/preset-env @babel/preset-react -D
```

这里面 `@babel/core` 是核心包，用它来对我们的代码进行编译转换。 `@babel/cli`可以让你在命令行中使用 `babel` 命令。 `preset` 是转换特定代码的预设。 `@babel/preset-env` 将 `ES6+` 代码转换成普通 js， `@babel/preset-react` 类似，不过是专门针对 `React` 的，将转换 ` jsx` 代码为普通 js。装完 `babel` 以后，在根目录创建 `babel`配置文件- `.babelrc`, 然后将我们安装的两个 preset 设置好。

```json
{
  "presets": ["@babel/env", "@babel/preset-react"]
}
```

使用 Webpack 打包` React` 相关代码时，需要用` babel` 进行编译转换，所以需要安装 `babel-loader` 配合webpack 使用。

```shell
yarn add babel-loader -D
```

修改 `webpack.config.js`

```js
...
modules: {
	rules: [
    {
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|bower_components)/,
      loader: "babel-loader",
    },
  ],
},
resolve: [extensions: ["*", ".js", ".jsx"]],
...
```

这里意思为使用 `babel-loader` 来处理除了 `node_modules` 和 `bower_component`文件夹外的 `js` 或者 ` jsx`  文件。 `resolve` 配置可以在 `import` 文件时，不用写上后缀。 比如 `import 'index.js'` 可以写为 `import 'index' `

接下来安装 `react` 和 `react-dom`

```shell
yarn add react react-dom
```

然后修改 `index.js`

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';

import './index.css';

ReactDOM.render(<App />, document.getElementById("content"));
```

新建 `/src/components/app.jsx `

```jsx
import React, { Component} from "react";

class App extends Component{
  render(){
    return(
      <div className="App">
        <div class="max-w-sm mx-auto flex p-6 bg-white rounded-lg shadow-xl">
            <div class="flex-shrink-0">
                <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo" />
            </div>
            <div class="ml-6 pt-1">
                <h4 class="text-xl text-gray-900 leading-tight">ChitChat</h4>
                <p class="text-base text-gray-600 leading-normal">You have a new message!</p>
            </div>
        </div>
      </div>
    );
  }
}

export default App;
```

`yarn build` 后打开页面，能够正常看到 `app.jsx` 内容说明` react` 已经生效。

## 六、模块热替换 HMR

在开发页面时，每修改一下就需要build然后刷新页面严重影响了开发效率。webpack 模块热替换可以自动局部刷新更新的内容。

> Tip: 不要在生产环境中使用 HMR

要启用 HMR很简单，安装好 `webpack-dev-serve` 并对其进行配置即可。

```shell
yarn add webpack-dev-server -D
```

安装好以后在 `package.json` 中加入 `scripts` 方便我们调用

```json
...
"scripts": {
	...,
	"dev": "webpack-dev-server"
},
...
```

接着修改 `webpack.config.js` 添加 `webpack-dev` 配置

```js
const webpack = require('webpack');
...
plugins: [
  ...,
  new webpack.HotModuleReplacementPlugin()
],
devServer: {
  contentBase: path.join(__dirname, "dist"),
  port: 3000,
  hotOnly: true,
},
...
```

这个时候如果你运行 `yarn dev` ，打开页面并进行一些修改，你会发现并没有自动刷新。 因为现在只是 webpack 做好了热更新准备，我们还需要告诉 webpack 我们更新了哪些内容。所以还需要安装一个 `react-hot-loader ` 组件

```shell
yarn add react-hot-loader -D
```

安装好以后修改 `app.jsx`

```jsx
import {hot} from "react-hot-loader";

import React, { Component} from "react";

class App extends Component{
  render(){
    return(
      <div className="App">
        <div className="max-w-sm mx-auto flex p-6 bg-white rounded-lg shadow-xl">
            <div className="flex-shrink-0">
                <img className="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo" />
            </div>
            <div className="ml-6 pt-1">
                <h4 className="text-xl text-gray-900 leading-tight">NIHAO HMR</h4>
                <p className="text-base text-gray-600 leading-normal">You have a new message!</p>
            </div>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);
```
此时修改 `app.jsx` 页面就会自动进行同步了。

但是...接下来会发现修改 CSS 并不会引发同步，没关系，`MiniCssExtractPlugin` 早已有此参数， 修改一下`webpack.config.js` 中 `loader` 配置即可

```js
...
{
    loader: MiniCssExtractPlugin.loader,
        options: {
            // only enable hot in development
            hmr: true,
            // if hmr does not work, this is a forceful method.
            reloadAll: true,
        },
},
...
```

完结！ 撒花！

## 七、参考资料

1. [Create a react app from scratch](https://blog.usejournal.com/creating-a-react-app-from-scratch-f3c693b84658)
2. [Webpack Document](https://www.webpackjs.com/concepts/)
3. [It's time for everyone to learn about PostCSS](https://davidtheclark.com/its-time-for-everyone-to-learn-about-postcss/)
4. [Tailwindcss Document](https://www.tailwindcss.cn/docs/installation/)
