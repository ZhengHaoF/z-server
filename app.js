const express = require('express');
const bodyParser = require('body-parser');
const multiparty = require('multiparty')
const fs = require("fs");
const app = express();


//引入跨域模块
var cors = require('cors');

//注册跨域模块
app.use(cors());

//这样框架才可以接收post请求
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//配置文件
let web_config = JSON.parse(fs.readFileSync("web_info.json"));
let open_web_path_list = [];

for (let i = 0; i < web_config.length; i++) {
    let webName = web_config[i]['webName'];
    let webPath = web_config[i]['webPath'];
    let webFilePath = web_config[i]['webFilePath'];
    console.log("网站《" + webName + "》启动,路径:" + "http://localhost:3000/" + webPath)
    app.use("/" + webPath, express.static("web/" + webFilePath));
    open_web_path_list.push(webPath)
}

app.get("/api/getWebInfo", (req, res) => {
    res.json(web_config);
})

//添加静态网站
app.post("/api/addWebInfo", (req, res) => {
    let newWebName = req.body.web_name;
    let newWebPath = req.body.web_path;
    let newWebFilePath = req.body.web_file_path;
    let new_web_info = {
        "webName": newWebName,
        "webPath": newWebPath,
        "webFilePath": newWebFilePath
    }

    fs.exists("web/" + newWebFilePath, function (exists) {
        if (!exists) {
            res.json(404, {
                "msg": "文件夹不存在"
            });
        } else {
            if (open_web_path_list.indexOf(newWebPath) === -1) {
                web_config.push(new_web_info);
                fs.writeFileSync("web_info.json", JSON.stringify(web_config), function (err) {

                })
                //在网站列表中添加
                open_web_path_list.push(newWebPath)
                console.log("网站《" + newWebName + "》启动,路径:" + "http://localhost:3000/" + newWebPath)
                //启动网站
                app.use("/" + newWebPath, express.static("web/" + newWebFilePath));
                res.json({
                    "msg": "启动成功",
                    "host": "http://localhost:3000/" + newWebPath
                });
            } else {
                res.json(500, {
                    "msg": "虚拟路径已存在"
                });
            }

        }
    })
})

app.post("/api/delWeb", (req, res) => {
    let web_file_path = req.body.web_file_path;
    console.log("收到指令，删除：" + web_file_path)
    for (let i = 0; i < web_config.length; i++) {
        if (web_config[i]['webFilePath'] == web_file_path) {
            web_config.splice(i, 1)
            fs.writeFileSync("web_info.json", JSON.stringify(web_config), function (err) {

            })
        }
    }
    res.json({
        "msg": "成功"
    });

})

app.post("/api/upload", function (req, res) {
    /* 生成multiparty对象，并配置上传目标路径 */
    let form = new multiparty.Form();
    // 设置编码
    form.encoding = 'utf-8';
    // 设置文件存储路径，以当前编辑的文件为相对路径
    form.uploadDir = './upload_zip';
    // 设置文件大小限制
    // form.maxFilesSize = 1 * 1024 * 1024;
    form.parse(req, function (err, fields, files) {
        try {
            //let inputFile = files.file[0];
            //let newPath = form.uploadDir + "/" + inputFile.originalFilename;
            // 同步重命名文件名 fs.renameSync(oldPath, newPath)
            //oldPath  不得作更改，使用默认上传路径就好
            //fs.renameSync(inputFile.path, newPath);
            res.send({
                data: "上传成功！"
            });
        } catch (err) {
            console.log(err);
            res.send({
                err: "上传失败！"
            });
        }
        ;
    })
});

app.get("/api/reload", function (req, res) {
    res.json({
        "msg": "重启成功"
    });

    process.exit();
})

app.get("/api/getFiles", function (req, res) {
    const _dirName = "G:\\"
    fs.readdir(_dirName, (err, files) => {
        if (err) {
            return res.end("不能读取")
        }
        let filesInfo = [];
        files.forEach((item) => {
            if (item !== "$RECYCLE.BIN" && item !== "System Volume Information") {
                filesInfo.push({
                    "objName":item,
                    "objType":fs.statSync(_dirName + item).isDirectory()?"Dir":"File"
                })
            }
        })
        res.json({
            "msg": filesInfo
        });
    })

})
//启动监听
app.listen(3000, () => {
    // console.log("http://localhost:3000")
})
