var express = require('express');
var app = express();

var redis = require("redis");
var client = redis.createClient({legacyMode:true});
client.connect();

client.mSet('header', 0, 'left', 0, 'article', 0, 'right', 0, 'footer', 0);
client.mGet(['header', 'left', 'article', 'right', 'footer'], (err,value) =>{
    console.log(value);
});


const data = () => {
    return new Promise((resolve,reject)=>{
        client.mGet(['header', 'left', 'article', 'right', 'footer'], (err,value) =>{
            const data = {
                'header': Number(value[0]),
                'left': Number(value[1]),
                'article': Number(value[2]),
                'right': Number(value[3]),
                'footer': Number(value[4])
            };
            err ? reject(null) : resolve(data);
        });
    });
}



app.use(express.static('public'));

app.get('/',(req,res) => {
 res.send('hello world!');
})

app.get('/data', (req,res) => {
    data().then((data)=>{
        res.send(data);
    });
});

app.get('/update/:key/:value', (req,res) => {
    const key = req.params.key;
    let value =  Number(req.params.value);
    client.get(key, (err,reply) => {
        value = Number(reply)+value;
        client.set(key, value);
    });

    data().then(data => {
        console.log(data);
        res.send(data);
   
    })
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});