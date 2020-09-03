const axios = require('axios');

class MonitorHelloServer {
    constructor(serverURL, agentName, agentIP, nets, monitors){
        this.serverURL = serverURL;
        this.agentName = agentName;
        this.agentIP = agentIP;
        this.nets = nets;
        this.monitors = monitors;
        this.helloURL = this.serverURL + '/hello';
        this.updateURL = this.serverURL + '/update';
        this.handle = null;
        this.update = null;
        this.sendHello();
    }

    // Send hello to every 5 minutes => 300 000 miliseconds
    sendHello(){
        process.nextTick(()=>{
            this.handle = setInterval(() => {
                axios.post(this.helloURL, {agent: this.agentName, ip: this.agentIP }).catch((error)=> {
                    console.log('Server not response');
                });
            }, 300000);

            this.update = setInterval(() => {
                // Add netstatus
                for (let i = 0; i < this.nets.length; i++) {
                    this.nets[i].monitor_state = this.monitors[i].getStatus();
                }

                axios.post(this.updateURL, {agent: this.agentName, ip: this.agentIP, nets: this.nets}).catch((error)=> {
                    console.log('Server not response');
                });
            }, 10000);
        });
    }

    stopHello(){
        clearInterval(this.handle);
        this.handle = null;
        clearInterval(this.update);
        this.update = null;
    }

    setNets(nets){
        this.nets = nets;
    }

    setMonitors(monitors){
        this.monitors = monitors;
    }

    restart(nets, monitors){
        this.stopHello();
        this.setNets(nets);
        this.setMonitors(monitors)
        this.sendHello();
    }

}

module.exports = MonitorHelloServer;