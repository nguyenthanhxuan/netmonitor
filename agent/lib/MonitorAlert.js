const axios = require('axios');

class MonitorAlert {
    constructor(serverURL, state) {
        this.state = state
        this.serverURL = `${serverURL}/alert`;
    }

    async report() {
        try {
            let response = await axios.post(this.serverURL, this.state);
        } catch(err) {
            console.log('Monitor alert false');
        }
    }
}

module.exports = MonitorAlert;
