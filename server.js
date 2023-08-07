const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 3500

//gets static files. Automatically looks in public folder
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

//catch all at the end. End path that doesn't exist will end up here
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found'})
    } else {
        res.type('text').send('404 Not Found')
    }
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))