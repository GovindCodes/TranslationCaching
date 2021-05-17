const express = require("express");
const app = express();
const translate = require("@vitalets/google-translate-api");

const fetch = require('node-fetch');
const redis = require('redis');
const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);

app.use(express.urlencoded());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public")); // serves files from the public directory
app.set("view engine", "ejs");

//cache middleware
function cache(req, res, next){
  const data = req.body;
  const speech = data.speech;
  const lang = data.language;
  const key = speech+lang;

  client.get(key, (err, data) => {
    if(err) throw err;

    if(data != null){
        res.render("index", { translated: data });
    }else{
        next();
    }
})
}

app.post("/", cache, async (req, res, next) => {
  console.log(req.body);
  const data = req.body;
  const speech = data.speech;
  const lang = data.language;
  const key = speech+lang;
  translate(speech, { to: lang })
    .then((response) => {
      console.log(response.text);
      const translatedText = response.text;
      
      // set to redis
      client.setex(key, 3600, translatedText);
      res.render("index", { translated: translatedText });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/", (req, res) => {
  res.render("index", { translated: "" });
});

app.listen(3000, console.log("server running at 3000"));
