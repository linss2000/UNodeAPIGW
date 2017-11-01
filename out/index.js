'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var jwt = require('jsonwebtoken-refresh');
var passport = require('passport');
var passportJWT = require('passport-jwt');
var mssql = require('mssql');
var DBase = require('./api/mssql');
var stream = require('stream');
var _ = require('lodash');
var fs = require('fs');
var fetch = require('node-fetch');
var nodemailer = require('nodemailer');
//const axios = require('axios');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';
var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) { return __awaiter(_this, void 0, void 0, function () {
    var tmpData, resultObj, parm, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('payload received', jwt_payload);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                parm = [];
                parm[0] = jwt_payload.authID;
                return [4 /*yield*/, DBase.DB.execSP("sps_checktoken", parm)];
            case 2:
                tmpData = _a.sent();
                //console.log(tmpData)
                resultObj = JSON.parse(tmpData);
                console.log(resultObj.data[0]);
                console.log(resultObj.data[0][0].validToken);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 4];
            case 4:
                if (resultObj.data[0][0].validToken == "Y") {
                    next(null, true);
                }
                else {
                    next(null, true);
                }
                return [2 /*return*/];
        }
    });
}); });
passport.use(strategy);
//const env = require("env.js");
var PORT = process.env.PORT || 3003;
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);
app.use('*', function (req, res, next) {
    console.log("Headers");
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
    console.log('Time:', Date.now());
    //console.log(await getURLs('db'));
    next();
});
// Socket.io
//const io = socket_io().listen(server);
//app.io = socket_io;
//DB = new DBase.DB();
DBase.DB.on('error', function (err) {
    console.log(err.message);
});
function getURLs(svcName) {
    return __awaiter(this, void 0, void 0, function () {
        var result, resultObj, results, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, DBase.DB.execSQl("select gs_name, gs_url from tAPIURL")];
                case 1:
                    result = _a.sent();
                    resultObj = JSON.parse(result);
                    console.log(resultObj.data[0]);
                    results = _.filter(resultObj.data[0], function (obj) {
                        //console.log(obj.gs_name)
                        return obj.gs_name.indexOf(svcName) !== -1;
                    });
                    return [2 /*return*/, results[0].gs_url];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, err_1];
                case 3: return [2 /*return*/];
            }
        });
    });
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
    console.log('a user connected');
    //send Ping to client connection
    socket.emit('ping', { type: 'INCOMING_PONG_PAYLOAD', payload: 'ping from server' });
    // receive from client (index.ejs) with socket.on
    socket.on('add-message', function (msg) {
        console.log('new add message: ' + msg);
        // send to client (index.ejs) with app.io.emit
        // here it reacts direct after receiving a message from the client
        //app.io.emit('chat-message', msg);
    });
    socket.on('pong-message', function (data) {
        console.log('new pong message: ' + data);
        //socket.emit('ping', { type: 'INCOMING_PONG_PAYLOAD', payload: 'pong response from server' });
        // send to client (index.ejs) with app.io.emit
        // here it reacts direct after receiving a message from the client
        //app.io.emit('chat-message', msg);
    });
});
app.get('/excel', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var nodeExcel, dateFormat, conf, arr, parm, tmpData, resultObj, i, a, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nodeExcel = require('excel-export');
                    dateFormat = require('dateformat');
                    conf = {};
                    arr = [];
                    conf.cols = [{
                            caption: 'ID.',
                            type: 'number',
                            width: 3
                        },
                        {
                            caption: 'User ID',
                            type: 'string',
                            width: 50
                        },
                        {
                            caption: 'Location',
                            type: 'string',
                            width: 75
                        },
                        {
                            caption: 'SQL',
                            type: 'string',
                            width: 150
                        },
                        {
                            caption: 'Start TM',
                            type: 'string',
                            width: 75
                        },
                        {
                            caption: 'End TM',
                            type: 'string',
                            width: 75
                        },
                        {
                            caption: 'Error',
                            type: 'string',
                            width: 150
                        },
                        {
                            caption: 'Error Desc',
                            type: 'string',
                            width: 150
                        }
                    ];
                    parm = [];
                    console.log("Before SQL");
                    console.log(Date.now());
                    return [4 /*yield*/, DBase.DB.execSQl("select top 100 gs_id,gs_user_i,gs_oru_i,gs_Sql,gs_strt_tm,gs_end_tm,gs_err,gs_err_desc from tdblog")];
                case 1:
                    tmpData = _a.sent();
                    console.log(tmpData);
                    resultObj = JSON.parse(tmpData);
                    //console.log(resultObj.data[0]);
                    console.log(Date.now());
                    if (resultObj.data[0].length > 0) {
                        arr = [];
                        for (i = 0; i < resultObj.data[0].length; i++) {
                            a = [
                                resultObj.data[0][i].gs_id,
                                resultObj.data[0][i].gs_user_i,
                                resultObj.data[0][i].gs_oru_i,
                                resultObj.data[0][i].gs_Sql,
                                (dateFormat(resultObj.data[0][i].gs_strt_tm, "mm/dd/yyyy HH:MM:ss")),
                                (dateFormat(resultObj.data[0][i].gs_end_tm, "mm/dd/yyyy HH:MM:ss")),
                                resultObj.data[0][i].gs_err,
                                resultObj.data[0][i].gs_err_desc,
                            ];
                            arr.push(a);
                        }
                        conf.rows = arr;
                        result = nodeExcel.execute(conf);
                        console.log(Date.now());
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                        res.setHeader("Content-Disposition", "attachment;filename=" + "todo.xlsx");
                        console.log(Date.now());
                        res.end(result, 'binary');
                        //res.status(200).send(new Buffer(result.toString(),'binary').toString("base64"));
                    }
                    return [2 /*return*/];
            }
        });
    });
});
app.post("/toLoadSvc", passport.authenticate('jwt', { session: false }), function (req, res) {
    try {
        console.log(req.get('Authorization'));
        var token = req.get('Authorization');
        token = token.toString().replace("JWT ", "");
        var originalDecoded = jwt.decode(token, { complete: true });
        console.log(JSON.stringify(originalDecoded));
        var refreshed = jwt.refresh(originalDecoded, 300, jwtOptions.secretOrKey);
        // new 'exp' value is later in the future. 
        console.log(JSON.stringify(jwt.decode(refreshed, { complete: true })));
        var output = JSON.stringify({ "message": "token refreshed", "token": refreshed, "result": 0 });
        res.status(200).json(output);
        //res.status(200).json({ "message": "Success! You can not see this without a token" });
    }
    catch (e) {
        console.log("error");
        console.log(e);
        var output = JSON.stringify({ "message": e, "token": null, "result": 0 });
        res.status(200).json(output);
    }
});
app.post("/sendEmail", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, transporter, htm, mailOptions, output, output, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log(req.body.hv_email);
                    parm = [];
                    parm[0] = req.body.hv_email;
                    return [4 /*yield*/, DBase.DB.execSP("sps_checkemail", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    if (resultObj.data[0].length > 0) {
                        transporter = nodemailer.createTransport({
                            service: 'gmail',
                            port: 465,
                            secure: true,
                            auth: {
                                user: 'kollive@gmail.com',
                                pass: 'nandu10016'
                            }
                        });
                        htm = "<div>Hi " + resultObj.data[0][0].hv_first_name + ",<br/><br/> We have received a request to reset your password. <br/> If you did not make this request, just ignore this message.";
                        htm += "Otherwise, you can reset your password using this link<br/><br/>";
                        htm += "<a href='http://localhost:3000/changepwd'> Click here to reset your password</a><br/>";
                        htm += "<br/>Thanks,<br/> The HVS Cadet Team";
                        mailOptions = {
                            from: 'kollive@gmail.com',
                            to: 'kollive@hotmail.com;' + req.body.hv_email,
                            subject: 'Reset your Password',
                            html: htm
                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        output = JSON.stringify({ "message": "ok", "token": null, "result": { val: 1, msg: "email sent to reset your password." } });
                        res.status(200).json(output);
                    }
                    else {
                        output = JSON.stringify({ "message": "ok", "token": null, "result": { val: -1, msg: "Please Enter a Valid email that was registered." } });
                        res.status(200).json(output);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post("/changePWD", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, output, output, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log(req.body.userID);
                    console.log(req.body.currPWD);
                    console.log(req.body.newPWD);
                    parm = [];
                    parm[0] = req.body.userID;
                    parm[1] = req.body.currPWD;
                    parm[2] = req.body.newPWD;
                    return [4 /*yield*/, DBase.DB.execSP("spu_updatePWD", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    if (resultObj.data[0].length > 0) {
                        output = JSON.stringify({ "message": "ok", "token": null, "result": { val: resultObj.data[0][0].hv_return, msg: resultObj.data[0][0].hv_msg } });
                        res.status(200).json(output);
                    }
                    else {
                        output = JSON.stringify({ "message": "ok", "token": null, "result": { val: -1, msg: "Please contact HelpDesk." } });
                        res.status(200).json(output);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post("/loginsvc", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, url, name, password, parms, data, e_4, uuidv4, authId, payload, token, parm, tmpData, e_5, output, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getURLs('logon')];
                case 1:
                    url = _a.sent();
                    //var url = "http://localhost:3001/loginsvc";        
                    console.log(url);
                    if (req.body.usr && req.body.pwd) {
                        name = req.body.usr;
                        password = req.body.pwd;
                    }
                    console.log(name);
                    console.log(password);
                    parms = JSON.stringify({
                        usr: name,
                        pwd: password
                    });
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            body: parms,
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 2:
                    data = _a.sent();
                    return [4 /*yield*/, data.json()];
                case 3:
                    result = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_4 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 5];
                case 5:
                    console.log(result);
                    console.log(JSON.parse(result).message);
                    if (!(JSON.parse(result).message == 1)) return [3 /*break*/, 10];
                    uuidv4 = require('uuid/v4');
                    authId = uuidv4();
                    payload = { userId: name, role: "read", authID: authId };
                    token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' });
                    console.log(token);
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    parm = [];
                    parm[0] = token;
                    parm[1] = name;
                    parm[2] = authId;
                    return [4 /*yield*/, DBase.DB.execSP("spi_taccesstoken", parm)];
                case 7:
                    tmpData = _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_5 = _a.sent();
                    console.log(e_5);
                    return [3 /*break*/, 9];
                case 9:
                    output = JSON.stringify({ "message": "ok", "token": token, "result": JSON.parse(result).result });
                    res.status(200).json(output);
                    return [3 /*break*/, 11];
                case 10:
                    output = JSON.stringify({ "message": JSON.parse(result).result, "result": "-1" });
                    res.status(200).json(output);
                    _a.label = 11;
                case 11:
                    //res.send(result);
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
});
app.post("/db", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, output, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    parm = [];
                    return [4 /*yield*/, DBase.DB.execSP("sps_getAttribTables", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
                    res.status(200).json(output);
                    return [3 /*break*/, 3];
                case 2:
                    e_6 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post("/GetAttribTable", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, output, e_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    parm = [];
                    parm[0] = req.body.hv_table_i;
                    return [4 /*yield*/, DBase.DB.execSP("sps_getAttribTableValues", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
                    res.status(200).json(output);
                    return [3 /*break*/, 3];
                case 2:
                    e_7 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post("/delAttribTable", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, output, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    parm = [];
                    parm[0] = req.body.hv_table_i;
                    parm[1] = req.body.hv_universal_i;
                    return [4 /*yield*/, DBase.DB.execSP("spd_AttribTableValues", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
                    res.status(200).json(output);
                    return [3 /*break*/, 3];
                case 2:
                    e_8 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post("/updAttribTable", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, output, e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    parm = [];
                    parm[0] = req.body.hv_table_i;
                    parm[1] = req.body.hv_universal_i;
                    parm[2] = req.body.hv_universal_name;
                    return [4 /*yield*/, DBase.DB.execSP("spu_AttribTableValues", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
                    res.status(200).json(output);
                    return [3 /*break*/, 3];
                case 2:
                    e_9 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.post("/insAttribTable", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, parm, tmpData, resultObj, output, e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    parm = [];
                    parm[0] = req.body.hv_table_i;
                    parm[1] = req.body.hv_universal_name;
                    return [4 /*yield*/, DBase.DB.execSP("spi_AttribTableValues", parm)];
                case 1:
                    tmpData = _a.sent();
                    resultObj = JSON.parse(tmpData);
                    console.log(resultObj.data[0]);
                    output = JSON.stringify({ "message": "ok", "token": null, "result": resultObj.data[0] });
                    res.status(200).json(output);
                    return [3 /*break*/, 3];
                case 2:
                    e_10 = _a.sent();
                    res.status(500).end();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
var api = require('./api');
app.use('/api', api.router);
app.use(express.static(__dirname + '/public'));
server.listen(PORT, function () {
    console.log("Listening on port " + PORT + "!");
});
//# sourceMappingURL=index.js.map