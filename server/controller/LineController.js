const axios = require('axios');
const url = require('url');

class LineController {
    constructor(){
        this.lineOA = process.env.LINE_OA || 'DZ0m1Kzb5FADz+KNonEguuJN6HPcNahxyyStVKKx06gwXzKVHrzVozjsTHcokIU/tKOyg9YgFdgZwt5UoVL0mc0NUedwohx0Fxh8rLHuNeEp+7Riv8XMH1wpLGem9TCbjuxFNbZlHXKWelZuFxTQ9gdB04t89/1O/w1cDnyilFU=';
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.lineOA}`;
    }

    isSendMessageSucess(response) {
        for(var key in response) {
            if(response.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    async sendMessage(message, to){
        let sendMessageURL = `https://api.line.me/v2/bot/message/push`;
        let messageObject = {
            "to": to,
            "messages":[
               {
                    "type": "text",
                    "text": message
                }
            ]
        };

        try {
            const response = await axios.post(sendMessageURL, messageObject);
            if (this.isSendMessageSucess(response)) {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = LineController;