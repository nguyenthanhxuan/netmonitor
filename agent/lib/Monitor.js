const ping = require('ping');
const axios = require('axios');
const EventEmitter = require('events').EventEmitter;

class Monitor extends EventEmitter {
    constructor(id, host, method, timeInterval, timeout, status) {
        super();
        this.id = id;
        this.host = host;
        this.method = method;
        this.timeInterval = timeInterval * 1000;
        this.timeout = timeout;
        this.handle = null;
        this.isUp = true;
        this.status = status;
        this.totalRequests = 0;
        this.totalDownTimes = 0;
        this.totalTimeout = 0;
        this.totalDies = 0;
        this.lastRequest = null;
        this.lastDownTime = null;
        this.isContinueDie = false;
        if (this.status) {
            this.start();
        }
    }

    getStatus() {
        return {
            id: this.id,
            host: this.host,
            method: this.method,
            timeInterval: this.timeInterval,
            timeout: this.timeout,
            status: this.status,
            totalRequests: this.totalRequests,
            totalDownTimes: this.totalDownTimes,
            totalTimeout: this.totalTimeout,
            totalDies: this.totalDies,
            lastRequest: this.lastRequest,
            lastDownTime: this.lastDownTime,
        };
    }

    monitorBehavior(isUp) {
        if (isUp) {
            this.emit('up', this.getStatus());
            this.isContinueDie = false;
        } else {
            this.emit('down', this.getStatus());
            if (this.totalTimeout > this.timeout) {
                this.totalTimeout = 0;
                
                if(this.isContinueDie){
                    this.totalDies ++;
                } else {
                    this.totalDies = 1;
                    this.isContinueDie = true;
                }

                this.emit('die', this.getStatus());
            }
        }
    }

    start() {
        this.status = true;
        if (this.method == '1') {
            this.handle = setInterval(() => {
                this.checkPing();
            }, this.timeInterval);
        } else if (this.method == '2') {
            this.handle = setInterval(() => {
                this.checkGetRequest();
            }, this.timeInterval);
        }
    }

    stop() {
        this.status = false;
        this.totalRequests = 0;
        this.totalDownTimes = 0;
        this.totalTimeout = 0;
        this.lastRequest = null;
        this.lastDownTime = null;
        this.totalDies = 0;

        clearInterval(this.handle);

        this.emit('stop', this.getStatus());
    }

    checkPing() {
        this.totalRequests += 1;
        this.lastRequest = Date.now();

        process.nextTick(() => {
            ping.promise.probe(this.host).then((res) => {
                this.isUp = res.alive;
                if (!res.alive) {
                    this.lastDownTime = Date.now();
                    this.totalDownTimes += 1;
                    this.totalTimeout += 1;
                } else {
                    this.totalTimeout = 0;
                }

                this.monitorBehavior(this.isUp);
            });
        });
    }

    checkGetRequest() {
        this.totalRequests += 1;
        this.lastRequest = Date.now();

        process.nextTick(() => {
            axios
                .get(this.host)
                .then((res) => {
                    if (res.status !== 200) {
                        this.isUp = false;
                        this.lastDownTime = Date.now();
                        this.totalDownTimes += 1;
                        this.totalTimeout += 1;
                    } else {
                        this.isUp = true;
                        this.totalTimeout = 0;
                    }

                    this.monitorBehavior(this.isUp);
                })
                .catch((error) => {
                    this.isUp = false;
                    this.lastDownTime = Date.now();
                    this.totalDownTimes += 1;
                    this.totalTimeout += 1;

                    this.monitorBehavior(this.isUp);
                });
        });
    }
}

module.exports = Monitor;
