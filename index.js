const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");
const request = require('request');
const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const fs = require('fs')
  res.send(req.headers['x-wx-openid']);
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  req.query;  
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});
app.get("/api/goPay", async (req, res) => {
 const open_id =  req.headers['x-wx-openid'];
 const order_id =  req.query.order_id;
 const price =  req.query.price;
const data= await new Promise((resolve, reject) => {
  request({
    method: 'POST',
    url: `https://pay.liyishabiubiu.cn/miniapp.php?open_id=${open_id}&order_id=${order_id}&price=${price}`
  },function (error, response) {
    console.log('接口返回内容', response.body)
    resolve(JSON.parse(response.body))
  });
});
    res.send(data);
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
