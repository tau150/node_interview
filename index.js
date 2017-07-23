const express = require('express');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const cheerio = require('cheerio');
const ejs = require('ejs');
const request = require("request");
const axios = require('axios');
const async = require('async');
const config = require('./config.json');
const app = express();



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

var db;

MongoClient.connect('mongodb://admin_interview:admin@ds163672.mlab.com:63672/node_interview', (err, database) => {
  if (err) return console.log(err)
  db = database

  app.listen(8888, () => {
    console.log('listening on 8888')
  })
})



app.post('/titles', (req, res) => {


  let urls = req.body.url.trim().split(" ");

  let finalResult = [];

  db.collection('titles').find().toArray((err, data) =>{
    data.map(function(element, index){
      return  db.collection('titles').update({url: element.url}, {$set: {counter:1}});
    })

  })


  async.eachSeries(urls, (url, next) => {

    if (req.body.optionsRadios === 'promises') {

      axios.get(url)
        .then(response => {
          const $ = cheerio.load(response.data);
          let fullResult = {
            url: url,
            title: $('title').text(),
            counter: 0,
            timestamp: Date.now()
          }

          db.collection('titles').find({url: fullResult.url}).toArray(  (err, data) =>{

            if(data.length === 0){

              db.collection('titles').save(fullResult, (err, result) => {
                if (err)  return next(err)
                finalResult.push(fullResult);
              });

            }

              next(null, fullResult)
          });
        })

        .catch(function (error) {
            let unrecognizedUrl = {
              url: url,
              title: 'NO RESPONDE',
              counter: 0,
              timestamp: Date.now()
            }

            db.collection('titles').save(unrecognizedUrl, (err, result) => {
              if (err)  return next(err)
              finalResult.push(unrecognizedUrl);
              next(null, unrecognizedUrl)

            });

        });

    } else {
        request(url,  (err, response, body) => {

          if(err){
              let unrecognizedUrl = {
                url: url,
                title: 'NO RESPONDE',
                counter: 0,
                timestamp: Date.now()
              }

              db.collection('titles').save(unrecognizedUrl, (err, result) => {
                if (err) return next(err)
                finalResult.push(unrecognizedUrl);
                next(null, unrecognizedUrl);
              });
          }

          else {
              const $ = cheerio.load(body);

              let fullResult = {
                url: url,
                title: $('title').text(),
                counter: 0,
                timestamp: Date.now()
              }

              db.collection('titles').find({url: fullResult.url}).toArray( (err, data)  => {
                if(err) return next(err)

                if(data.length === 0){

                  db.collection('titles').save(fullResult, (err, result) => {
                    if (err)  return next(err)
                    finalResult.push(fullResult);
                    next(null, fullResult);

                  });

                } else {
                  next();
                }
              });
          }

        });
      }

  }, (err) => {

    db.collection('titles').find().toArray((err, data) =>{
      res.render('index.ejs', {titles: data});
    })

  })
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/index.html');
})


app.get('*', (req, res) => {
  res.render('404.html');
});
