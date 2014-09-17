/**
 * Created by Administrator on 2014/8/18 0018.
 */

var email = require('emailjs/email');

var server = email.server.connect({
    user: 'yang891218',
    password: '891218982181',
    host: 'smtp.163.com',
    ssl: true
});

var headers = {
    text: "i hope this works",
    from: "yang891218@163.com",
    to: "luguang.yang@vixtel.com",
    cc: "",
    subject: "testing emailjs"
};

var message = email.message.create(headers);

message.attach_alternative('<html><strong style="color: red;">This is Red Text</strong></html>html>');

server.send(message, function (err, message) {
    console.log(err || message);
});
