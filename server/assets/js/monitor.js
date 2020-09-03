$(document).ready(function(){
    var socket = io();

    var method = ['ICMP (Ping)', 'HTTP - GET'];
    
    socket.on('hello', function(data){
        var nets = data.nets;
        var html_net = nets.reduce((html, net) => {
            var class_status = 'list-group-item-success';
            if(net.monitor_state.totalTimeout != 0) {
                class_status = "list-group-item-danger";
            }

            var lastdownTimeString = '0';

            if(net.monitor_state.lastDownTime != null){
                var lastdownTime = new Date(net.monitor_state.lastDownTime);
                lastdownTimeString = lastdownTime.toLocaleString();
            }
    
            html += `<div class="col mb-4">
                    <div class="card">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item ${class_status}">Kết nối: ${net.name}</li>
                            <li class="list-group-item">Host/Domain: ${net.host}</li>
                            <li class="list-group-item">Phương thức: ${method[parseInt(net.method) - 1]}</li>
                            <li class="list-group-item">Số request: ${net.monitor_state.totalRequests}</li>
                            <li class="list-group-item">Tổng request lỗi: ${net.monitor_state.totalDownTimes}</li>
                            <li class="list-group-item">Last down time: ${lastdownTimeString}</li>
                        </ul>
                        <div class="card-footer">
                            <small class="text-muted">Lần request gần nhất: ${net.fromNow}</small>
                        </div>
                    </div>
                </div>`;
            return html;
        }, '');

        $('section[ip="'+ data.ip +'"] .network').html(html_net);
    });   
})