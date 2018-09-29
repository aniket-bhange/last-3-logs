const fs = require('fs')
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

        return new Promise((resolve, reject)=>{  
            let stream = fs.createReadStream(this.location + this.filename, this.fileOptions)
            let data = "";
            let lines = [];
            stream.on("data", (moredata)=>{
                data += moredata;
                lines = data.split("\n");
                if(lines.length > 1){
                    stream.destroy()
                    lines.pop()
                    if(this.lineCount < lines.length) {
                        lines = lines.slice(lines.length - this.lineCount, lines.length);
                    }
                    resolve(lines)
                }
            })

            stream.on("error", ()=> reject("error"))
            stream.on("end", ()=> { 
                resolve(lines)
            })
        });
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