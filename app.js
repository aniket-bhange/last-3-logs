const fs = require('fs');
const path = require('path');
const Logger = require('./helpers/logger');
var app = require('http').createServer(ServerHandler);
const io = require('socket.io')(app);
logger = new Logger({
    location: './logs',
    lineCount: 3
})
app.listen(8080, ()=> { console.log("server started") });

var SuccessResponse = (res, options)=>{
    res.writeHead(options.status, {"Context-Type": options.contentType})
    res.end(options.data)
}


function ServerHandler(req, res){
    let filepath = req.url;
    if(filepath == "/"){
        filepath = "/views/index.html";
    }

    let extension = path.extname(filepath);
    let extname = String(extension).toLowerCase();
    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };
    let contentType = mimeTypes[extname] || "application/octet-stream";

    if(contentType !== "application/octet-stream"){
        fs.readFile(__dirname + filepath, (err, data)=>{
            if(!err){
                SuccessResponse(res, {contentType, data, status: 200})
            }
        });
    }
    
}

async function logOps(){
    try{
        let result = await logger.readLog()
        return result
    }catch(err){
        console.log(err)
        return []
    }
}

io.on('connection', async function (socket) {
    socket.on('logsmonitor', async function (data) {
        logger.log(data)
        socket.emit('reciveLogs', await logOps())
    });
    socket.emit('reciveLogs', await logOps())
});