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
const axios = require('axios');

const mongoose = require('mongoose');
mongoose.connect("mongodb://hvs:hvs@cluster0-shard-00-00-zq0f1.mongodb.net:27017,cluster0-shard-00-01-zq0f1.mongodb.net:27017,cluster0-shard-00-02-zq0f1.mongodb.net:27017/hvs?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin");
var conn = mongoose.connection;

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
const gfs = Grid(conn.db);

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

var users = [{
    "id": 1,
    "name": "tkolli",
    "password": "tkolli"
},
{
    "id": 2,
    "name": "test",
    "password": "test"
}
];

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';


var strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
    console.log('payload received', jwt_payload);
    const tmpData, resultObj;
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
        next(null, false);
    }
    
    /*
    // usually this would be a database call:
    var user = users[_.findIndex(users, { id: jwt_payload.userId })];
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
    */
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

/** Setting up storage using multer-gridfs-storage */
var storage = GridFsStorage({
    gfs: gfs,
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    },
    /** With gridfs we can store aditional meta-data along with the file */
    metadata: function (req, file, cb) {
        cb(null, { originalname: file.originalname });
    },
    root: 'ctFiles' //root name for collection to store files into
});

var upload = multer({ //multer settings for single upload
    storage: storage
}).single('file');

async function getURLs(svcName) {
    try {
        var result = await DBase.DB.execSQl("select gs_name, gs_url from tAPIURL")
        var resultObj = JSON.parse(result);
        console.log(resultObj.data[0]);
        var results = _.filter(resultObj.data[0], function (obj) {
            console.log(obj.gs_name)
            return obj.gs_name.indexOf(svcName) !== -1;
        });

        //var retObj = JSON.parse(results)
        ///console.log(results);
        //console.log(results[0].gs_url);
        //console.log(resultObj)
        return results[0].gs_url;
        //resultObj = JSON.parse(result);
        //console.log("After Title Call")
        //let gs_ttl_i = resultObj.data[0][0].gs_ttl_i;
    } catch (err) {
        return err;
        //response.send(err); 
    }
}



async function getData() {
    try {
        return await DBase.DB.execSQl("select top 1 gs_document_name, gs_document from tleaveappdocs")
        //resultObj = JSON.parse(result);
        //console.log("After Title Call")
        //let gs_ttl_i = resultObj.data[0][0].gs_ttl_i;
    } catch (err) {
        console.log("error in TestAsync")
        console.log(err)
        return err;
        //response.send(err); 
    }
}


/** API path that will upload the files */
app.get('/convertToMongo', async function (req, res) {
    //req.body["SQL"] = "select top 1 gs_document_name, gs_document from tleaveappdocs";
    //var data = getData().data[0][0];
    console.log("before call")
    var d = await DBase.DB.execSQl("select top 30 gs_document_name, gs_document from tleaveappdocs");
    //console.log(d)
    //console.log("After call")
    //console.log(data)

    const defaults = {
        flags: 'w',
        //defaultEncoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true
    };

    //var data = JSON.parse(d).data[0][1];
    var data = JSON.parse(d).data[0];

    for (var i = 0; i < data.length; i++) {
        console.log(data[i].gs_document_name);
        //console.log(data[i]);
        //var stream = fs.createWriteStream('\\tmpfiles\\' + data[i].gs_document_name);
        //fs.closeSync(fs.openSync(filepath, 'w'));
        var bitmap = new Buffer(data[i].gs_document.data, 'base64');
        // write buffer to file
        //var file = fs.openSync('\\tmpfiles\\' + data[i].gs_document_name)
        fs.writeFileSync('\\tmpfiles\\' + data[i].gs_document_name, bitmap);
        //fs.closeSync(file)


        /*
        stream.once('open', function(fd) {
            stream.write(bitmap);
            //stream.write(data.gs_document.data);
            stream.end();
        });
        */
    }

    /*
    upload(req, res, function(err) {
        if (err) {
            //res.json({ error_code: 1, err_desc: err });
            res.status(404).send(JSON.stringify({ error_code: 1, err_desc: err }));
            return;
        }
        res.status(200).send(JSON.stringify({ error_code: 0, err_desc: null }));
        //res.json({ error_code: 0, err_desc: null });
    });
    */
});


/** API path that will upload the files */
app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            //res.json({ error_code: 1, err_desc: err });
            res.status(404).send(JSON.stringify({ error_code: 1, err_desc: err }));
            return;
        }
        res.status(200).send(JSON.stringify({ error_code: 0, err_desc: null }));
        //res.json({ error_code: 0, err_desc: null });
    });
});

app.post('/getFiles', function (req, res) {
    console.log("in GetFiles")
    gfs.collection('ctFiles'); //set collection name to lookup into
    /** First check if file exists */
    gfs.files.aggregate(
        [
            //{ $match: { "metadata.originalname": "/.*Pava.*/" } },
            /*
            {
                $match: {
                    "metadata.originalname": { $regex: /^Ste/ },
                    $or: [{ "length": { $gt: 46690 } }, { "contentType": "application/pdf" }]
                }
            },
            */
            { $project: { "filename": 1, "contentType": 1, "length": 1, "originalname": "$metadata.originalname", "uploadDate": 1 } },
            { $sort: { uploadDate: 1 } }
        ]).toArray(function (err, files) {
            //gfs.files.find().toArray(function(err, files) {
            if (!files || files.length === 0) {
                return res.status(404).send(JSON.stringify({
                    responseCode: 1,
                    responseMessage: err
                }));
            }

            return res.status(200).send(JSON.stringify(files));
        });
});


app.get('/file/:filename', function (req, res) {
    gfs.collection('ctFiles'); //set collection name to lookup into

    /** First check if file exists */
    gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
        if (!files || files.length === 0) {
            return res.status(404).send(JSON.stringify({
                responseCode: 1,
                responseMessage: "error"
            }));
        }
        /** create read stream */
        var readstream = gfs.createReadStream({
            filename: files[0].filename,
            root: "ctFiles"
        });
        /** set the proper content type */
        console.log(files[0].contentType)
        res.set('Content-Type', files[0].contentType)
        res.set('Content-Disposition', 'attachment; filename="' + files[0].filename + '"');

        /** return response */
        return readstream.pipe(res);
    });
});

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


// convert image to base64 encoded string
//var base64str = base64_encode('kitten.jpg');
//console.log(base64str);
// convert base64 string back to image 
//base64_decode(base64str, 'copy.jpg');

async function TestAsync() {
    try {
        var parm = [];
        parm[0] = "2017"
        parm[1] = "R"
        parm[2] = "02"
        parm[3] = "02M011"
        parm[4] = "1"
        // '2017', 'R', '02', '02M011', '1',@newmodno output
        const result = await DBase.DB.execSP("SPS_COM_TTOMODI", parm);

        parm = [];
        parm[0] = "000"
        parm[1] = "1111"
        parm[2] = "test"
        // '2017', 'R', '02', '02M011', '1',@newmodno output
        result = await DBase.DB.execSP("spi_teobj", parm);
        /*
        spi_teobj 'null','1111','1234'      
        if (result instanceof Error) {
            console.log("Error")
        }
        */
        console.log(result)

        parm = [];
        parm[0] = "TRTRQ"
        result = await DBase.DB.execSP("sps_GetTTLOL", parm);
        console.log(result)
        let resultObj = JSON.parse(result);
        //console.log(resultObj.data)
        console.log(resultObj.data[0][0].gs_ttl_i)

        result = await DBase.DB.execSQl("select top 1 gs_ttl_i from ttlol where gs_ttl_i = 'TRTRQ'")
        resultObj = JSON.parse(result);
        console.log("After Title Call")
        let gs_ttl_i = resultObj.data[0][0].gs_ttl_i;

        result = await DBase.DB.execSQl("select top 1 gs_oru_i from toru where gs_oru_i = '01M019'")
        resultObj = JSON.parse(result);
        console.log("After School Call")
        let gs_oru_i = resultObj.data[0][0].gs_oru_i;

        console.log(gs_oru_i)

        result = await DBase.DB.execSQl(" Select top 10 gs_pr_name from ttodetail where gs_oru_i = '" + gs_oru_i + "' and gs_ttl_i = '" + gs_ttl_i + "'")
        console.log(result)
        return "After Test";
    } catch (err) {
        console.log("error in TestAsync")
        console.log(err)
        return err;
        //response.send(err); 
    }
}

var nsp = io.of('/projects/test_cases');
nsp.on('connection', function (socket) {
    console.log('someone Connected!');
    nsp.emit('message', 'data');
});


const api = require('./api');

var cb0 = function (req, res, next) {
    console.log('CB0')
    next()
}

var cb1 = function (req, res, next) {
    console.log('CB1')
    next()
}

var cb2 = function (req, res, next) {
    console.log('CB2')
    next()
}

app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Place Holder for postman

//app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended: true }));


/*
app.use(bodyParser.urlencoded({
    extended: true
}));
*/


async function LoginAsync(user, pwd) {
    try {

        /*
        var parm = [];
        parm[0] = user
        parm[1] = pwd
        var result = await DBase.DB.execSP("sps_checkUser", parm);
        */
        var parm = [];
        parm[0] = user
        //parm[1] = pwd
        var result = await DBase.DB.execSP("sps_CheckUserIDDebug", parm);
        console.log(result)
        let resultObj = JSON.parse(result);
        //console.log(resultObj.data)
        //console.log(resultObj.data[0][0].hv_valid)
        console.log("Password")
        console.log(resultObj.data[0][0].Password)
        if (pwd == resultObj.data[0][0].Password) {
            return "Y";
        } else {
            return "N";
        }
        //return resultObj.data[0][0].hv_valid;
    } catch (err) {
        console.log("error in TestAsync")
        console.log(err)
        return err;
        //response.send(err); 
    }
}

app.post("/reactlogin", async function (req, res) {
    //console.log("in")
    //console.log("111111111111111111111111111111")
    //console.log(await TestAsync());
    //console.log("2222222222222222222222222222222")
    var name;
    var password;

    if (req.body.name && req.body.password) {
        name = req.body.name;
        password = req.body.password;
    }
    console.log(req.body)
    //console.log(req.body.name)
    //console.log(req.body.password)
    console.log(name)
    console.log(password)

    var retVal = await LoginAsync(name, password);

    //if (user.password == req.body.password) {
    if (retVal == "Y") {
        console.log("A")
        // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
        var payload = { id: name };
        var token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' }); // '1h'
        console.log(token)

        var result = await DBase.DB.execSQl("select top 100 gs_pr_name,gs_oru_i,gs_ttl_i,gs_bdgt_amt from ttodetail where gs_fy_yy = '2018' and gs_mod_st = '5' and isnull(gs_pr_i,'') <> ''");
        console.log(result)
        let resultObj = JSON.parse(result);
        console.log(resultObj.data[0])
        //res.send(token)
        var output = JSON.stringify({ "message": "ok", "token": token, "result": resultObj.data[0] });
        res.status(200).json(output);
        //res.status(200).json(JSON.stringify( resultObj.data[0] ));
        //res.status(200).send(output);
    } else {
        console.log("B")
        //res
        //    .status(200)
        //    .send("test");
        var output = JSON.stringify({ "message": "passwords did not match", "result": "-1" });
        res.status(200).json(output);
    }
});


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


/*
//start listen with socket.io
app.io.on('connection', function(socket) {
    console.log('a user connected')

    socket.on('load-data', function(msg) {
        console.log('loadData: ' + msg);
        / *
        app.post("/api/db", function(req, res, next) {
                console.log('Request URL:', req.originalUrl)
                next()
            })* /
        //app.io.emit('message', msg);
    })

    // receive from client (index.ejs) with socket.on
    socket.on('add-message', function(msg) {
        console.log('new message: ' + msg)
            // send to client (index.ejs) with app.io.emit
            // here it reacts direct after receiving a message from the client
        app.io.emit('message', msg);
    })
})
*/

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


app.post("/loginsvc", async function (req, res) {
    var result;

    try {
        var url = await getURLs('logon');
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

    if (JSON.parse(result).message == "ok") {

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
        var output = JSON.stringify({ "message": "User Id/ password doesn't exists", "result": "-1" });
        res.status(200).json(output);
    }
    //res.send(result);
    console.log(result);

    //res.status(200).send(JSON.stringify({ data:result }));
    /*
    axios.post(url,{                
        SQL: 'select * from ttlol'
        })
        .then(function (response) {
            console.log(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });

        */
    /*
    request.post({
        url: url,
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: parms        
      }, function(error, response, body){
      console.log(body);
    });
    */
    //var body = { SQL: 'select * from ttlol'};
    //const result = await 
    /*
    if (headers['transfer-encoding'] === 'chunked') {
        delete headers['content-length'];
    }
    */
    /*
    request(url, { 
        method: 'POST',
        body:   {parms},
        headers: { 'Content-Type':'application/json'}, 
        //headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        //headers: { 'Content-Type': 'application/json',
        //'Content-Length': parms.length    
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => {console.log(err);});
    */

    //console.log(result);
    //res.status(200).send("Called DB Service");
});

app.post("/login", async function (req, res) {
    //console.log("in")
    //console.log(req.body)
    //console.log(req.body.name)
    //console.log(req.body.password)
    console.log("111111111111111111111111111111")
    //console.log(await TestAsync());
    console.log("2222222222222222222222222222222")
    var name;
    var password;

    if (req.body.name && req.body.password) {
        name = req.body.name;
        password = req.body.password;
    }
    // usually this would be a database call:
    var user = users[_.findIndex(users, { name: name })];
    //console.log(user)
    //console.log(name)
    //console.log(password)

    console.log(user.password)
    console.log(req.body.password)

    if (!user) {
        res.status(401).json({ message: "no such user found", "result": -1 });
    }

    if (user.password == req.body.password) {
        console.log("A")
        // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
        var payload = { id: user.id };
        var token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' }); // '1h'
        console.log(token)
        //res.send(token)
        var output = JSON.stringify({ "message": "ok", "token": token, "result": 0 });
        res.status(200).json(output);
        //res.status(200).send(output);
    } else {
        console.log("B")
        //res
        //    .status(200)
        //    .send("test");
        res.status(200).send(JSON.stringify({ message: "passwords did not match", "result": -1 }));
    }
});

app.post("/secret", passport.authenticate('jwt', { session: false }), function (req, res) {
    console.log(req.get('Authorization'))
    var token = req.get('Authorization');
    token = token.toString().replace("JWT ", "")
    var originalDecoded = jwt.decode(token, { complete: true });
    console.log(JSON.stringify(originalDecoded));
    var refreshed = jwt.refresh(originalDecoded, 300, jwtOptions.secretOrKey);

    // new 'exp' value is later in the future. 
    console.log(JSON.stringify(jwt.decode(refreshed, { complete: true })));
    var output = JSON.stringify({ "message": "ok", "token": refreshed, "result": 0 });
    res.status(200).json(output);
    //res.status(200).json({ "message": "Success! You can not see this without a token" });
});

async function getUserAsync(username) {
    const res = await fetch('https://api.github.com/users/' + username);
    return { user: await res.json(), found: res.status === 200 };
}

async function getObjectAsync(url) {
    return (await fetch(url)).json();
}

app.get('/api/async-await/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userResult = await getUserAsync(username);

        if (!userResult.found) {
            res.status(404).end();
            return;
        }

        const { user } = userResult;
        const { repos_url, followers_url } = user;
        const [repos, followers] =
            await Promise.all([getObjectAsync(repos_url), getObjectAsync(followers_url)]);

        user.repos = repos;
        user.followers = followers;

        res.send(user);
    } catch (e) {
        res.status(500).end();
    }
});

app.post("/dbas", async function (req, res) {
    var result;

    try {
        var url = await getURLs('db');
        console.log(url);

        var sql = req.body.SQL;
        console.log(sql);

        var p = ""
        var parms = JSON.stringify({
            SQL: sql
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
    /*
    .then(res => res.json())
    .then(json => {
        console.log(json.data[0]);        
        }
    )
    .catch(err => {console.log(err);});
    */

    //res.send(result);
    console.log(result);
    res.status(200).send(JSON.stringify({ data: result }));
    /*
    axios.post(url,{                
        SQL: 'select * from ttlol'
        })
        .then(function (response) {
            console.log(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });

        */
    /*
    request.post({
        url: url,
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: parms        
      }, function(error, response, body){
      console.log(body);
    });
    */
    //var body = { SQL: 'select * from ttlol'};
    //const result = await 
    /*
    if (headers['transfer-encoding'] === 'chunked') {
        delete headers['content-length'];
    }
    */
    /*
    request(url, { 
        method: 'POST',
        body:   {parms},
        headers: { 'Content-Type':'application/json'}, 
        //headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        //headers: { 'Content-Type': 'application/json',
        //'Content-Length': parms.length    
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => {console.log(err);});
    */

    //console.log(result);
    //res.status(200).send("Called DB Service");
});



app.get("/db", async function (req, res) {
    var result;

    try {
        var url = await getURLs('db');
        console.log(url);

        var p = ""
        var parms = JSON.stringify({
            SQL: 'select * from ttlol'
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
    /*
    .then(res => res.json())
    .then(json => {
        console.log(json.data[0]);        
        }
    )
    .catch(err => {console.log(err);});
    */

    res.send(result);
    /*
    axios.post(url,{                
        SQL: 'select * from ttlol'
        })
        .then(function (response) {
            console.log(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });

        */
    /*
    request.post({
        url: url,
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: parms        
      }, function(error, response, body){
      console.log(body);
    });
    */
    //var body = { SQL: 'select * from ttlol'};
    //const result = await 
    /*
    if (headers['transfer-encoding'] === 'chunked') {
        delete headers['content-length'];
    }
    */
    /*
    request(url, { 
        method: 'POST',
        body:   {parms},
        headers: { 'Content-Type':'application/json'}, 
        //headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        //headers: { 'Content-Type': 'application/json',
        //'Content-Length': parms.length    
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => {console.log(err);});
    */

    //console.log(result);
    //res.status(200).send("Called DB Service");
});

app.get("/secretDebug",
    function (req, res, next) {
        console.log(req.get('Authorization'));
        next();
    },
    function (req, res) {
        res.status(200).json("debugging");
    });


app.use('/multiple', [cb0, cb1, cb2], function (req, res, next) {
    console.log('the response will be sent by the next function ...')
    next()
}, function (req, res) {
    res.send('Hello from D!')
})

app.use('/user/:id', function (req, res, next) {
    console.log('Request URL:', req.originalUrl)
    next()
}, function (req, res, next) {
    console.log('Request Type:', req.method)
    next()
})

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.use('/api', api.router);
app.use(express.static(__dirname + '/public'));

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
})