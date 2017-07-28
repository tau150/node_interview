const express = require('express');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose')
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


app.listen(8888, () => {
  console.log('listening on 8888')
})

  let dbState;

  let promise = mongoose.connect(config.connection, {
    useMongoClient: true,
  });

  promise.then(function(db) {
    if(db) return console.log('database connected');
  });

  promise.catch(function(err){
    dbState = false;
  });


  app.use(function(req, res, next) {
    if (dbState === false) {
      res.status(500);
      return res.render('500.html');
    }
    next();
  });


 let TitlesModel = mongoose.model('titles', {url: 'string', title: 'string'});


saveOnDatabase = (obj, cb) =>{
  let url = obj.url

  TitlesModel.find({ 'url': url }, function (err, docs) {
    if (docs.length == 0){
      TitlesModel.create({ url: obj.url, title: obj.title }, function (err, objInstance) {
      if (err) return handleError(err);
      cb();
      });
    }else{
      cb();
    }
  });
}

app.post('/titles', (req, res) => {
  let urls=[];

  if( typeof(req.body.url)=== 'object') {

    for (let userUrl of req.body.url) {
        let parserUrl =  userUrl.trim();
        urls.push(parserUrl);
    }

  }else{
    urls.push(req.body.url.trim());
  }

  async.eachSeries(urls, (url, next) => {

    if (req.body.optionsRadios === 'promises') {

      axios.get(url)
        .then(response => {
          const $ = cheerio.load(response.data);
          let fullResult = {
            url: url,
            title: $('title').text(),
          }
          saveOnDatabase(fullResult, next);
        })

        .catch(function (error) {
            let unrecognizedUrl = {
              url: url,
              title: 'NO RESPONDE'

            }
            saveOnDatabase(unrecognizedUrl, next);
        });

    } else {
        request(url,  (err, response, body) => {

          if(err){
              let unrecognizedUrl = {
                url: url,
                title: 'NO RESPONDE'
              }

              saveOnDatabase(unrecognizedUrl, next);
          }

          else {
              const $ = cheerio.load(body);

              let fullResult = {
                url: url,
                title: $('title').text(),

              }
              saveOnDatabase(fullResult, next);
          }

        });
      }

  }, (err) => {

      TitlesModel.find({}, function(err, docs) {
        if (!err){
            res.render('index.ejs', {titles: docs, urls: urls });
        } else {throw err;}
      });

  })
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/index.html');
})


app.get('*', (req, res) => {
  res.render('404.html');
});
