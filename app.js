var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var methodOverride = require("method-override");
var pg = require("pg");

var config = {
	database: "dailyplanet_app",
	port: 5432,
	host: "localhost"
};




//takes information from the body of the individual page we are GETting from
app.use(bodyParser.urlencoded({extended: true}));

//allows us to use the Delete/Update methods
app.use(methodOverride("_method"));

//this is for allowing us to view our individual pages
app.set("view engine", "ejs");

//for adding style/css
app.use(express.static(__dirname + "/public"));

app.get("/site", function (req, res) {
	res.render("site/index.ejs");
});

app.get("/site/about", function (req, res) {
	res.render("site/about.ejs");
});

app.get("/site/contact", function (req, res) {
	res.render("site/contact.ejs");  
});

app.get("/articles", function (req, res) {
  pg.connect(config, function (err, client, done) {
    if (err) {
      console.log("OOPS!!! SOMETHING WENT WRONG!", err);
    }
    client.query("SELECT * FROM articles", [], function (err, result) {
      done();
      console.log(result.rows);
      var articleList = result.rows;
      res.render("articles/index.ejs", {articleList: articleList});
    });
  });
});

app.get("/articles/new", function (req, res) {
	res.render("articles/new.ejs");
});


app.get("/articles/show/:article_id", function(req, res) {
  var article_id = Number(req.params.article_id);
  pg.connect(config, function (err, client, done) {
    if (err) {
      console.error("OOPS!!! SOMETHING WENT WRONG!", err);
    }
    client.query("SELECT * FROM articles WHERE article_id = $1", [article_id], function (err, result) {
      done();
      console.log("THIS IS RESULT");
      console.log(result.rows[0]);
      var article = result.rows[0];
      res.render("articles/show.ejs", {newArticle: article});
    });
  });
});

app.post("/articles/new", function (req, res) {
 var newArticle = req.body.article;
   pg.connect(config, function(err, client, done){
        if (err) {
             console.error("OOOPS!!! SOMETHING WENT WRONG!", err);
        }
        client.query("INSERT INTO articles (title, summary) VALUES ($1, $2) RETURNING *", [req.body.newArticle.title, req.body.newArticle.summary], function (err, result) {
            done(); 
            console.log(result.rows);
            var article = result.rows[0];
            res.redirect("/articles/show/" + article.article_id);           
        });

    });
});

//Delete an article by ID
// app.delete("/articles/:id", function (req, res) {
//   var articleId = parseInt(req.params.id);
//   var articleIndex = null;
//   for (var i = 0, notFound = true; i < articles.length && notFound; i+=1) {
//     if (articles[i].id == articleId) {
//       notFound = false;
//       articleIndex = i;
//     }
//   }
//   if (notFound) {
//     res.send(404).send("Article Not Found");
//   } else {
//     articles.splice(articleIndex, 1);w
//     res.redirect("/articles");
//   }
// });

//Listens to make sure that JS is running
app.listen(3000, function() {
	console.log(new Array(50).join("*"))
	console.log("LISTENING!");
  console.log(new Array(50).join("*"))
});