const express = require('express'),
    path = require('path'),
    rendertron = require('rendertron-middleware')

const botUserAgents = [
    'googlebot',
    'Baiduspider',
    'bingbot',
    'Embedly',
    'facebookexternalhit',
    'LinkedInBot',
    'outbrain',
    'pinterest',
    'quora link preview',
    'rogerbot',
    'showyoubot',
    'Slackbot',
    'TelegramBot',
    'Twitterbot',
    'vkShare',
    'W3C_Validator',
    'WhatsApp',
]

const app = express()

app.use(rendertron.makeMiddleware({
    proxyUrl: 'https://render-tron.appspot.com/render',
    userAgentPattern: new RegExp(botUserAgents.join('|'), 'i'),
}));

app.use(express.static(__dirname + '/dist'));

app.listen(8080)