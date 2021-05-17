const express = require('express');
const translate = require('@vitalets/google-translate-api');
const redis = require('redis');

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);
const app = express();

app.use(express.urlencoded());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public')); // serves files from the public directory
app.set('view engine', 'ejs');

// cache middleware
function cache(req, res, next) {
  const data = req.body;
  const { speech, language } = data;
  const key = speech + language;

  client.get(key, (err, recdata) => {
    if (err) throw err;

    if (recdata != null) {
      res.render('index', { translated: recdata });
    } else {
      next();
    }
  });
}

// eslint-disable-next-line no-unused-vars
app.post('/', cache, async (req, res, _next) => {
  // console.log(req.body);
  const data = req.body;
  const { speech, language } = data;
  const key = speech + language;
  translate(speech, { to: language })
    .then((response) => {
      // console.log(response.text);
      const translatedText = response.text;
      // set to redis
      client.setex(key, 3600, translatedText);
      res.render('index', { translated: translatedText });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get('/', (_req, res) => {
  res.render('index', { translated: '' });
});

module.exports = app.listen(PORT, console.log(`server running at ${PORT}`));
