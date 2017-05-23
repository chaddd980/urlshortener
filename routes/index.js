var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://chadd980:Bakura15@ds155130.mlab.com:55130/urlshortener");
mongoose.connect(process.env.MONGODB_URI);
var Schema = mongoose.Schema;


var urlSchema = new Schema({
  url: String,
  shortUrl: String,
  number: Number
})

var Url = mongoose.model('Url', urlSchema);
var initial;

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/new/:url(*)', function(req, res) {
  // check if url is valid
  param = req.params.url;
  reg = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  if (reg.exec(param) === null) {
    res.render("error");
  } else {
    // newParam = reg.exec(param)[0];
    var foundUrl

    // check if url is already in database
    Url.find({ url: param}, function(err, url) {
      foundUrl = url;
      if(err) throw err;
      else if(url.length !== 0){
        res.json({url: foundUrl[0].url, shortUrl: foundUrl[0].shortUrl})
      } else{

        // check if anything in the database
        Url.find({}, function(err, objUrl) {
          if (err) throw err;
          else if (objUrl.length === 0) {
            initial = 1000;
            console.log("first url" + initial)
            render();
          } else {
            console.log(objUrl)
            initial = objUrl[objUrl.length-1].number + 1
            // console.log(objUrl[objUrl.length-1].number)
            console.log("not new url" + initial)
            render();
          }
        })
      }
    })
  }
  // create Url document and return json object
  function render() {
    // shortUrl = `https://chaddurlshortener.herokuapp.com/${initial}`;
    shortUrl = `https://localhost:3000/${initial}`;
    var item = {
      url: param,
      shortUrl: shortUrl,
      number: initial
    }
    var data = new Url(item).save(function(err, doc) {
      if(err){res.json(err)}
      else {
        console.log('success')
        mongoose.model('Url').find(function(err, urls) {
          if(err){res.json(err)}
          res.json(item);
        })
      }
    });
  }
});

router.get('/:shorturl', function(req, res, next) {
  param = req.params.shorturl;
  Url.find({ shortUrl: `https://chaddurlshortener.herokuapp.com/${param}` }, function(err, sUrl) {
    if(err) throw err;
    else if(sUrl.length !== 0) {
      var fullUrl = sUrl[0].url;
      res.redirect(fullUrl);
    } else {
      res.redirect("/")
    }
  });
});

module.exports = router;
