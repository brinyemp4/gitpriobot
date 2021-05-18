"use strict";
require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
const serverless = require("serverless-http");
app.use(express.json());

const telegram_url = "https://api.telegram.org/bot" + process.env.TELEGRAM_API_TOKEN +"/sendMessage";
const openWeatherUrl = process.env.OPENWEATHER_API_URL;

const sendMessage = (url, message,reply,res) => {
    axios.post(url, {
        chat_id: `${message.chat.id}`,
        text: reply
    }).then(response => {
        console.log("Message posted.");
    }).catch(error => {
        console.log(error);
    });
}

const getForecast = (city) => {
    let new_url = openWeatherUrl + city+"&appid="+process.env.OPENWEATHER_API_KEY;
    return axios.get(new_url).then(response => {
        let temp = response.data.main.temp;
        //converts temperature from kelvin to celsuis
        temp = Math.round(temp - 273.15); 
        let city_name = response.data.name;
        let resp = "It's "+temp+" degrees in "+city_name;
        return resp;
    }).catch(error => {
        console.log(error);
    });
}

app.post("/start_bot", function(req, res) {
    const { message } = req.body;
    let reply = "Welcome to telegram weather bot";
    let city_check = message.text.toLowerCase().indexOf('/');
    if(message.text.toLowerCase().indexOf("hi") !== -1) {
        sendMessage(telegram_url,message,reply,res);
    } else if( (message.text.toLowerCase().indexOf("check") !== -1) && (city_check !== -1 ) ) {
        city = message.text.split('/')[1];
        getForecast(city).then( response => {
            // post_forecast(telegram_url,response,message,res)
            sendMessage(telegram_url,message,response,res);
        });
    } else {
        reply = "request not understood, please review and try again.";
        sendMessage(telegram_url,message,reply,res);
        return res.end();
    }
});

// app.listen(process.env.PORT, () => {
//     console.log(`Server was started on port: ${process.env.PORT}`);
// });

module.exports.handler = serverless(app);
