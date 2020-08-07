import express from 'express';

const app = express();
const router = express.Router();

router.post('/register', function (req, res) {
  res.send(204);
});

router.get('/commonstudents', function (req, res) {
  res.send(204);
});

router.post('/suspend', function (req, res) {
  res.send(204);
});

router.post('/retrieveForNotifications', function (req, res) {
  res.send(204);
});

app.use('/api', router);

app.listen(3000);
