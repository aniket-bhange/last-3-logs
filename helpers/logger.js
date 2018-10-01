const fs = require('fs')
const sys = require('util')
const exec = require('child_process').exec;

module.exports = class Logger{
    constructor(options){
        this.location = options.location || "./";
        this.lineCount = options.lineCount || 10;
        this.filename = "/file.log";
        this.fileOptions =  {
            flags: "r",
            encoding: "utf-8",
            fd: null,
            mode: 438,
            bufferSize: 64 * 1024
        };
    }

    readLog(){
        if(!this.isFilePresent()){
            return Promise.reject({msg: "file is not present"});
        }
        console.log(process.platform)
        let query = "";
        if(process.platform == 'win32') {
            query = "powershell Get-Content -Tail 3 " + this.location + this.filename
        }

        if(process.platform == 'linux') {
            query = "tailf -3 " + this.location + this.filename
        }
        return new Promise((resolve, reject)=>{
            exec(query, (err, stdout, stderr)=>{
                if(err || stderr) {
                    return reject(err || stderr)
                }
                let lines = stdout.split(/\r?\n/);
                lines.pop()
                resolve(lines)
            });
        })
        
    }

    isFilePresent(){
        return fs.existsSync(this.location)
    }
    
    writeLog(data){
        data = JSON.parse(data)
        data.timestamp = new Date()
        data = JSON.stringify(data)
        var logWriteStream = fs.createWriteStream(this.location + this.filename, { flags: 'a'});
        logWriteStream.end(data + "\n")
    }

    log(data){
        try{
            this.writeLog(JSON.stringify(data))
        }catch(err){
            console.log(err)
        }
        
    }


}