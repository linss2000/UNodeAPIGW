'use strict';

const jwt = require('jsonwebtoken-refresh');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const mssql = require('mssql');
const DBase = require('./api/mssql');
const stream = require('stream');
const _ = require('lodash');
const fs = require('fs');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
import * as os from "os";
//const axios = require('axios');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';


var strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
    console.log('payload received', jwt_payload);
    const tmpData,resultObj;
    //Log the token in database
    try {
        var parm = [];        
        parm[0] = jwt_payload.authID;

        tmpData = await DBase.DB.execSP("sps_checktoken", parm);
        //console.log(tmpData)
        resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        console.log(resultObj.data[0][0].validToken);

    } catch (e) {
        console.log(e)
        //res.status(500).end();
    }

    if(resultObj.data[0][0].validToken == "Y") {
        next(null, true);
    } else {
        next(null, true);
    }
    
});

passport.use(strategy);

//const env = require("env.js");
const PORT = process.env.PORT || 3003;
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);


app.use('*', function (req, res, next) {
    console.log("Headers")
    //console.log(req.header("Access-Control-Request-Headers"));
    //console.log(req)
    //console.log(TestAsync());
    //,,
    //res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,Access-Control-Allow-Origin,Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", true);
    //res.header("Transfer-Encoding", "chunked");
    //res.header("Content-Type", "text/plain");
    //res.header("Content-Type", "application/json");
    res.io = app.io;
    //res.header("Accept", "q=0.8;application/json;q=0.9"); ,
    //res.header("Connection", "keep-alive");
    console.log('Time:', Date.now())
    //console.log(await getURLs('db'));
    next()
});

// Socket.io
//const io = socket_io().listen(server);
//app.io = socket_io;

//DB = new DBase.DB();
DBase.DB.on('error', function (err) {
    console.log(err.message);
});

async function getURLs(svcName) {
    try {
        var result = await DBase.DB.execSQl("select gs_name, gs_url from tAPIURL")
        var resultObj = JSON.parse(result);
        console.log(resultObj.data[0]);

        var results = _.filter(resultObj.data[0], function (obj) {
            //console.log(obj.gs_name)
            return obj.gs_name.indexOf(svcName) !== -1;
        });

        return results[0].gs_url;
    } catch (err) {
        return err;
        //response.send(err); 
    }
}


// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}


app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.io = io.sockets.on('connection', function (socket) {
    console.log('a user connected')
    //send Ping to client connection
    socket.emit('ping', { type: 'INCOMING_PONG_PAYLOAD', payload: 'ping from server' });

    // receive from client (index.ejs) with socket.on
    socket.on('add-message', function (msg) {
        console.log('new add message: ' + msg)
        // send to client (index.ejs) with app.io.emit
        // here it reacts direct after receiving a message from the client
        //app.io.emit('chat-message', msg);
    })

    socket.on('pong-message', function (data) {
        console.log('new pong message: ' + data)
        //socket.emit('ping', { type: 'INCOMING_PONG_PAYLOAD', payload: 'pong response from server' });
        // send to client (index.ejs) with app.io.emit
        // here it reacts direct after receiving a message from the client
        //app.io.emit('chat-message', msg);
    })
})


app.post("/toLoadSvc", passport.authenticate('jwt', { session: false }), function (req, res) {
    try {
        console.log(req.get('Authorization'))
        var token = req.get('Authorization');

        token = token.toString().replace("JWT ", "")
        var originalDecoded = jwt.decode(token, { complete: true });
        console.log(JSON.stringify(originalDecoded));

        var refreshed = jwt.refresh(originalDecoded, 300, jwtOptions.secretOrKey);
        // new 'exp' value is later in the future. 
        console.log(JSON.stringify(jwt.decode(refreshed, { complete: true })));
        var output = JSON.stringify({ "message": "token refreshed", "token": refreshed, "result": 0 });
        res.status(200).json(output);
        //res.status(200).json({ "message": "Success! You can not see this without a token" });
    } catch (e) {
        console.log("error")
        console.log(e)
        var output = JSON.stringify({ "message": e, "token": null, "result": 0 });
        res.status(200).json(output);
    }
});


app.post("/sendEmail", async function (req, res) {
    var result;
    try {
        console.log(req.body.hv_email)
        const parm = [];
        parm[0] =  req.body.hv_email;
        const tmpData = await DBase.DB.execSP("sps_checkemail", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        if (resultObj.data[0].length > 0) {
        
           
        /*
        var transporter = nodemailer.createTransport({
            host: 'server54.web-hosting.com',
            port: 465,
            secure: true,
            auth: {
            user: 'venugopal.kolli@hudsonvalleysystems.com',
            pass: 'Mini8536!'
            }
        });
  
        var mailOptions = {
            from: 'venugopal.kolli@hudsonvalleysystems.com',
            to: 'kollive@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
        };
        */
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
            user: 'kollive@gmail.com',
            pass: 'nandu10016'
            }
        });
  
        var htm = "<div>Hi " + resultObj.data[0][0].hv_first_name + ",<br/><br/> We have received a request to reset your password. <br/> If you did not make this request, just ignore this message.";
        htm += "Otherwise, you can reset your password using this link<br/><br/>"
        htm += "<a href='http://localhost:3000/changepwd'> Click here to reset your password</a><br/>"
        htm += "<br/>Thanks,<br/> The HVS Cadet Team"

        var mailOptions = {
            from: 'kollive@gmail.com',
            to: 'kollive@hotmail.com;' + req.body.hv_email,
            subject: 'Reset your Password',
            html: htm,          
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });

        var output = JSON.stringify({ "message": "ok", "token": null, "result": {val: 1, msg: "email sent to reset your password."} });
        res.status(200).json(output);
    }else {
        var output = JSON.stringify({ "message": "ok", "token": null, "result": {val: -1, msg: "Please Enter a Valid email that was registered."}  });
        res.status(200).json(output);
    }
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});

app.post("/changePWD", async function (req, res) {
    var result;
    try {
        console.log(req.body.userID)
        console.log(req.body.currPWD)
        console.log(req.body.newPWD)
        const parm = [];
        parm[0] =  req.body.userID;
        parm[1] =  req.body.currPWD;
        parm[2] =  req.body.newPWD;

        const tmpData = await DBase.DB.execSP("spu_updatePWD", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        if (resultObj.data[0].length > 0) {
                   
        var output = JSON.stringify({ "message": "ok", "token": null, "result": {val: resultObj.data[0][0].hv_return, msg: resultObj.data[0][0].hv_msg} });
        res.status(200).json(output);
    }else {
        var output = JSON.stringify({ "message": "ok", "token": null, "result": {val: -1, msg: "Please contact HelpDesk."}  });
        res.status(200).json(output);
    }
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});


app.post("/loginsvc", async function (req, res) {
    var result;

    try {
        //var url = await getURLs('logon');
        var url = "http://localhost:3001/loginsvc";        
        console.log(url);

        var name;
        var password;

        if (req.body.usr && req.body.pwd) {
            name = req.body.usr;
            password = req.body.pwd;
        }

        console.log(name)
        console.log(password)

        var parms = JSON.stringify({
            usr: name,
            pwd: password
        });

        const data = await fetch(url, {
            method: 'POST',
            body: parms,
            headers: { 'Content-Type': 'application/json' },
            //headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            //headers: { 'Content-Type': 'application/json',
            //'Content-Length': parms.length    
        })

        result = await data.json();

    } catch (e) {
        res.status(500).end();
    }

    console.log(result)
    console.log(JSON.parse(result).message)

    if (JSON.parse(result).message == 1) {

        const uuidv4 = require('uuid/v4');
        const authId = uuidv4(); // ⇨ 'df7cca36-3d7a-40f4-8f06-ae03cc22f045'

        var payload = { userId: name, role: "read", authID: authId };
        var token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' }); // '1h'
        console.log(token)

        //Log the token in database
        try {
            const parm = [];
            parm[0] = token;
            parm[1] = name;
            parm[2] = authId;

            const tmpData = await DBase.DB.execSP("spi_taccesstoken", parm);
            //console.log(tmpData)
            //console.log(tmpData.data[0].hv_auth_code)

        } catch (e) {
            console.log(e)
            //res.status(500).end();
        }

        var output = JSON.stringify({ "message": "ok", "token": token, "result": JSON.parse(result).result });
        res.status(200).json(output);

    } else {
        var output = JSON.stringify({ "message":  JSON.parse(result).result, "result": "-1" });
        res.status(200).json(output);
    }
    //res.send(result);
    console.log(result);
});

app.post("/db", async function (req, res) {
    var result;

    try {
      
        const parm = [];
        const tmpData = await DBase.DB.execSP("sps_getAttribTables", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        var output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
        res.status(200).json(output);
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});


app.post("/GetAttribTable", async function (req, res) {
    var result;

    try {
        const parm = [];
        parm[0] =  req.body.hv_table_i;
        const tmpData = await DBase.DB.execSP("sps_getAttribTableValues", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        var output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
        res.status(200).json(output);
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});

app.post("/delAttribTable", async function (req, res) {
    var result;

    try {
        const parm = [];
        parm[0] =  req.body.hv_table_i;
        parm[1] =  req.body.hv_universal_i;
        const tmpData = await DBase.DB.execSP("spd_AttribTableValues", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        var output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
        res.status(200).json(output);
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});

app.post("/updAttribTable", async function (req, res) {
    var result;

    try {
        const parm = [];
        parm[0] =  req.body.hv_table_i;
        parm[1] =  req.body.hv_universal_i;
        parm[2] =  req.body.hv_universal_name;

        const tmpData = await DBase.DB.execSP("spu_AttribTableValues", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        var output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
        res.status(200).json(output);
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});

app.post("/insAttribTable", async function (req, res) {
    var result;

    try {
        const parm = [];
        parm[0] =  req.body.hv_table_i;
        parm[1] =  req.body.hv_universal_name;

        const tmpData = await DBase.DB.execSP("spi_AttribTableValues", parm);

        //console.log(tmpData)
        const resultObj = JSON.parse(tmpData);
        console.log(resultObj.data[0]);
        var output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
        res.status(200).json(output);
        //console.log(resultObj.data[0][0].validToken);
        //console.log(tmpData)
        //console.log(tmpData.data[0].hv_auth_code)
    } catch (e) {
        res.status(500).end();
    }
   
    //res.send(result);
});




const api = require('./api')
app.use('/api', api.router);
app.use(express.static(__dirname + '/public'));

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
})