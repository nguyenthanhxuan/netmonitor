const axios = require('axios');
const url = require('url');
const { getAdminUser } = require('./UserController');

class ZaloController {
    constructor(appId, appSecret, db) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.db = db;
        this.oaCode = '';
        this.access_token = '';
        this.handle = null;
        this.getAccessTokenEvery50Minutes();
    }

    async getAccessToken() {
        const adminUser = await getAdminUser(this.db);
        this.setOACode(adminUser.oauthCode);
        let accessTokenURL = `https://oauth.zaloapp.com/v3/access_token?app_id=${this.appId}&app_secret=${this.appSecret}&code=${this.oaCode}`;
        try {
            const response = await axios.get(accessTokenURL);
            this.access_token = response.data.access_token;
        } catch (error) {
            console.log(error);
        }
    }

    setOACode(oaCode) {
        this.oaCode = oaCode;
    }

    getAccessTokenEvery50Minutes() {
        process.nextTick(() => {
            (async () => {
                await this.getAccessToken();
            })();
            this.handle = setInterval(() => {
                (async () => {
                    await this.getAccessToken();
                })();
            }, 3400000);
        });
    }

    async sendMessage(message, link, to) {
        let sendMessageURL = `https://graph.zalo.me/v2.0/me/message`;
        let sendMessageURLObject = url.parse(sendMessageURL);
        sendMessageURLObject.query = {
            access_token: this.access_token,
            message: message,
            link: link,
            to: to,
        };

        try {
            const response = await axios.post(url.format(sendMessageURLObject));
            if (response.data.to != undefined) {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = ZaloController;
