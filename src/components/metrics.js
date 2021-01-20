//export NODE_OPTIONS="--require appmetrics/start"
var appmetrics = require('appmetrics');
/*appmetrics.setConfig('advancedProfiling', {'threshold':60000})
appmetrics.emit('memory', {'time':60000})
*/
var monitoring = appmetrics.monitor();

let timeCPU = new Date().getTime();
let timeMemory = new Date().getTime();
let save_metrics_every = 1;//time in minute

const CoCreateCRUD = require("./routes/core/CoCreate-CRUD.js")

module.exports  = ()=>{ //BEGIN function init
    console.log("·------------------ METRICS ");
    const socket = {
                    "config": {
                      "apiKey": "c2b08663-06e3-440c-ef6f-13978b42883a",
                    	"securityKey": "f26baf68-e3a9-45fc-effe-502e47116265",
                    	"organization_Id": "5de0387b12e200ea63204d6c"
                    },
                    "host": "server.cocreate.app:8088"
                }
    CoCreateCRUD.CoCreateSocketInit(socket)
            
    monitoring.on('initialized', function (env) {
        env = monitoring.getEnvironment();
        for (var entry in env) {
            console.log(entry + ':' + env[entry]);
        };
    });
    
    monitoring.on('cpu', function (cpu) {
        let dataSave = {}
        dataSave['organization_id'] = socket.config.organization_Id;
        dataSave['time'] = new Date(cpu.time);
        dataSave['process'] = cpu.process;
        dataSave['system'] = cpu.system;
        dataSave['type'] = 'cpu';
        let time2 = new Date().getTime();        
        if( ( (time2 - timeCPU) / 1000 / 60 ) > save_metrics_every ){
            timeCPU = new Date().getTime();
            CoCreateCRUD.CreateDocument({
            	collection: 'metrics',
            	broadcast_sender: true,
            	broadcast: true,
            	data: dataSave,
            }, socket.config);
            console.log('[' + new Date(cpu.time) + '] CPU: ' + cpu.process);
        }
    });
    
    monitoring.on('memory', function (memory) {
        let dataSave = {}
        dataSave['organization_id'] = socket.config.organization_Id;
        dataSave['time'] = new Date(memory.time);
        dataSave['physical_total'] = memory.physical_total;
        dataSave['physical_used'] = memory.physical_used;
        dataSave['physical_free'] = memory.physical_free;
        dataSave['virtual'] = memory.virtual;
        dataSave['private'] = memory.private;
        dataSave['physical'] = memory.physical;
        dataSave['type'] = 'memory';
        let time2 = new Date().getTime();        
        if( ( (time2 - timeMemory) / 1000 / 60 ) > save_metrics_every ){
            timeMemory = new Date().getTime();
            CoCreateCRUD.CreateDocument({
            	collection: 'metrics',
            	broadcast_sender: true,
            	broadcast: true,
            	data: dataSave,
            }, socket.config);
            console.log('Memory [' + memory.physical + ' / '+memory.physical_used+']  ' );
        }
    });
        
}//END function init