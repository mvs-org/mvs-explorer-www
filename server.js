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

app.use(function (req, res, next) {
    res.set('Cache-Control', 'public, max-age=300, s-max-age=3600')
    res.set('Vary', 'User-Agent')
    next()
})

if (process.env.RENDERTRON_PROXY) {
    app.use(rendertron.makeMiddleware({
        proxyUrl: process.env.RENDERTRON_PROXY,
        userAgentPattern: new RegExp(process.env.RENDERTRON_AGENTS_MATCHER || botUserAgents.join('|'), 'i'),
        timeout: process.env.RENDERTRON_TIMEOUT || 5000,
    }))
}

app.use(express.static(__dirname + '/dist'));

app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname + '/dist', 'index.html'));
});

app.listen(80)