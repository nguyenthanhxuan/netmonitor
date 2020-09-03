
// const monitor = require('./lib/Monitor');

// let data = new monitor(1, '10.230.1.1', 1, 5, 10, true);

// data.on('up', function(status){
//     console.log('up');
//     console.log(status);
// })

// data.on('down', function(status){
//     console.log('down');
//     console.log(status);
// })

// let data1 = new monitor(2, 'https://google.com', 2, 1, 10, true);

// data1.on('up', function(status){
//     console.log('d-1up');
//     // console.log(status);
// })

// data1.on('down', function(status){
//     console.log('d1-down');
//     // console.log(status);
// })

// data1.on('die', (status) => {
//     console.log('total die');
// })


// process.nextTick(function(){
//     console.log('ok')
// })
// let t = 0;
// let time = null;
// function test(){
//     process.nextTick(function(){
//         console.log('working next: ' + t);
//         if(t == 10) {
//             clearInterval(time);
//         }
//         t ++;
//     })
// }

// function test(){
//     process.nextTick(function(){
//         setTimeout(() => {
//             console.log('working next: ' + t);
//             if(t == 10) {
//                 clearInterval(time);
//             }
//             t ++;
//         }, 200);
//     })
    
// }

// test();
// time = setInterval(() => {
//     test();
// }, 1000);

// let ping = require('ping')
// let host = '10.230.1.1';
// var cfg = {
//     timeout: 10,
// };
 

// ping.sys.probe(host, function(isAlive){
//     var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
//     console.log(msg);
// }, cfg);

// ping.promise.probe(host)
// .then(function (res) {
//     console.log(res);
// });



// let d = new Date(1597132776013);

// const url = require('url');
// let full = url.parse('http://dantri.com.vn/da');
// full.query = {
//     access_token:1,
//     message: 'op'
// };
// console.log(full)
// console.log(url.format(full));


const { networkInterfaces } = require('os');

const nets = networkInterfaces();
console.log(nets);
const results = Object.create(null); // or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }

            results[name].push(net.address);
        }
    }
}

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
  })