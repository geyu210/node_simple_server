'use strict'
const mime = require('mime');
const http = require('http');
const path = require('path');
const url  = require('url');
const fs   = require('fs');
let qs =require('querystring');
let assert = require('assert');
const root=__dirname;
let cache={};
//let filePath;
function show(res,req) {
    res.statusCode = 200;
    req=req.setEncoding('utf-8');
    let absPath = "."+ "/sicp"+url.parse(req.url).pathname;
    console.log("absPath",absPath);

    let pathroot = path.join(root,url.parse(req.url).pathname);
    if (req.url==='/'){
        let filePath = '/sicp/book.html';
        let absPath = "."+ filePath;
        pathroot = path.join(root,filePath);
        serverStatic(res,cache,absPath)
    }   else {
        //filePath = req.url;
        serverStatic(res,cache,absPath)
    }
}

function notFound(res){
    res.statusCode=404;
    res.setHeader('Content-Type','text/plain');
    res.end('Not Found');
}

function badRequest(res){
    res.statusCode = 400;
    res.setHeader('Content-Type','text/plain');
    res.end('Bad Request')
}
function add (req,res){

    let body = '';
    req.setEncoding('utf8');
    req.on('data',function(chunk){ body += chunk});

    req.on('end',function(){
        console.log("body="+body);
        let obj = qs.parse(body);
        console.log(url.parse(req.url).pathname);
        let aaa=decodeURIComponent(url.parse(req.url).pathname);
        let reg=/[\u4E00-\u9FA5 A-Z a-z 0-9 _ ()（）\- ]+/;
        let bbb=aaa.match(reg);

        console.log(aaa);
        console.log(bbb);
        console.log(typeof bbb);


    })
}

//==============================================
const server = http.createServer((req,res) =>{

    switch (req.method) {
        case 'GET':
            console.log("GET请求到了")
            console.log(url.parse(req.url).pathname);
            show(res,req);

            break;
        case 'POST':
            console.log("POST请求到了");
            console.log(url.parse(req.url).pathname);
            add(req,res);

            break;
        default :
            badRequest(res);
    }

});
server.listen(8080);

function serverStatic(response,cache,absPath){
    if (cache[absPath]){
        sendFile(response,absPath,cache[absPath]);
    } else {
        //console.log("absPath="+absPath)
        fs.access(absPath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error("File doesn't exist");
                send404(response);
                return;
            }
            fs.readFile(absPath, function (err, data) {
                if (err) {
                    send404(response);
                } else {
                    cache[absPath] = data;
                    sendFile(response, absPath, data);
                }
            })
        });

    }
}

function sendFile(response,filePath,fileContents){

    response.writeHead(200,
        {"Content-Type" : mime.getType(path.basename(filePath))}
    );
    console.log("mime.getType(path.basename(filePath))"+mime.getType(path.basename(filePath)));
    console.log(fileContents);
    response.end(fileContents);
};

function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('error 404 :resource not not not found.');
    response.end();
}
