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

var ErrorResponse = (error, response)=>{
    response.writeHead(500)
    response.end("Sorry check with addmin for error")
}

var SuccessResponse = (res, options)=>{
    res.writeHead(options.status, {"Context-Type": options.contentType})
    res.end(options.data)
}


function ServerHandler(req, res){
    console.log(req.url)    
    let filepath = req.url;
    if(filepath == "/"){
        filepath = "/views/index.html";
    }
    console.log(filepath)
    let extension = path.extname(filepath);
    let extname = String(extension).toLowerCase();
    console.log(extname)
    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };
    let contentType = mimeTypes[extname] || "application/octet-stream";

    console.log(contentType)

    if(contentType == "application/octet-stream"){
        
    } else {
        let data = fs.readFileSync(__dirname + filepath);
        console.log(data)
        SuccessResponse(res, {contentType, data, status: 200})
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
        console.log(data);
        logger.log(data)
        socket.emit('reciveLogs', await logOps())
    });
    socket.emit('reciveLogs', await logOps())
});