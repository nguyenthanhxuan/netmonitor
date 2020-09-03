$(document).ready(function(){
    var socket = io();
    $('.user-click').on('click', function(){
        var uid = $(this).attr('uid');
        if($(this).hasClass('active')){
            socket.emit('user-disable', uid);
            $(this).text('Gửi cảnh báo');
        } else {
            socket.emit('user-enable', uid);
            $(this).text('Dừng gửi cảnh báo');
        }
    });

    socket.on('user-disabled', function(uid){
        $('.user-status[uid="'+uid+'"').removeClass('badge-success').addClass('badge-warning').text('Tạm dừng');
    });

    socket.on('user-enabled', function(uid){
        $('.user-status[uid="'+uid+'"').removeClass('badge-warning').addClass('badge-success').text('Hoạt động');
    });

    // Agent config
    $('.agent-delete').on('click', function(){
        var agent_id = $(this).attr('agent-id');
        socket.emit('agent-delete', agent_id);
    });

    socket.on('agent-deleted', function(agent_id){
        $('button[agent-id="'+agent_id+'"]').parents('tr').remove();
    })
});