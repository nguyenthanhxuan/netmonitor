// const { ipcRenderer } = require('electron');
const app = new Vue({
    el: '#app',
    data: {
        name:'test',
        status: 0,
    },
    mounted(){
        console.log('mou');
    },
    methods: {
        add_net: function(){
            ipcRenderer.send('add-net');
        }
    }
});