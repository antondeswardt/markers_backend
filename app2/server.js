'use strict';

const express = require('express');

const EXPRESS_PORT = process.env.EXPRESS_PORT || '8080';

const EXPRESS_HOST = process.env.EXPRESS_HOST || '0.0.0.0';

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const mongo = require('mongodb').MongoClient;

const MONGODB_USER = process.env.MONGODB_USER || 'root';

const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'example';

const MONGODB_HOST = process.env.MONGODB_HOST || '192.168.99.104';

const MONGODB_PORT = process.env.MONGODB_PORT || '27017';

const MONGODB_DB = process.env.MONGODB_DB || 'places';

const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION|| 'markers';

const mongoURL_MANUAL = "mongodb://root:example@192.168.99.104:27017/places?authSource=admin";

const mongoURL_ENVS = "mongodb://" + MONGODB_USER + ":" + MONGODB_PASSWORD + "@" + MONGODB_HOST + ":" + MONGODB_PORT + "/" + MONGODB_DB + "?authSource=admin";

console.log("MONGODB URL #1 is " + mongoURL_MANUAL);

console.log("MONGODB URL #2 is " + mongoURL_ENVS);

mongo.connect(mongoURL_ENVS, { 

    useNewUrlParser: true,
    useUnifiedTopology: true

  }, (err, client) => {

  if (err) {

    console.error(err);
    return;

  }

  console.log('Connected to Database');

  const db = client.db(MONGODB_DB);

  const collection = db.collection(MONGODB_COLLECTION);

  app.listen(EXPRESS_PORT, EXPRESS_HOST);

  console.log('Express Server listening on http://' + EXPRESS_HOST + ':' + EXPRESS_PORT);


  // HANDLERS TO FOLLOW

  app.get('/', function(request, response) {

    response.sendFile(__dirname + '/index.html');

  });

  app.post('/new_marker', function(request, response) {

    console.log(request.body.type);
    console.log(request.body.geometry.type);
    console.log(request.body.geometry.latitude);
    console.log(request.body.geometry.longitude);
    console.log(request.body.properties.title);
    console.log(request.body.properties.description);

    var my_data = {

      "type": request.body.type,
      "geometry": {
        "type": request.body.geometry.type,
        "coordinates": [parseFloat(request.body.geometry.latitude), parseFloat(request.body.geometry.longitude)]
      },
      "properties": {
        "title": request.body.properties.title,
        "description": request.body.properties.description
      }
    }

    collection.insertOne(my_data).then(result => {

        console.log("added a marker");

        response.redirect('/');

    }).catch(err => console.error(err));

  });

  app.get('/get_markers', (request, response) => {

    collection.find().toArray((err, items) => {

      if (err) {

        console.log("Server Error in /get_markers find()");

        throw error(err);

      }

      console.log("returning all markers");

      response.send(items);

    });

  });

});
