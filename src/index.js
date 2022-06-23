const express = require('express');
const bodyParser = require('body-parser');
const route = require('../src/Route/route');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




mongoose.connect("mongodb+srv://myfunctionup-data:NemFawWgwh8vnMPv@cluster0.h27rj25.mongodb.net/Akashgupta-db",
    { useNewUrlParser: true })


    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))



app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
