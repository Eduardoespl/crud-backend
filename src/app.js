const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const tasksRouter = require('./routes/taskRoutes')
const projectsRouter = require('./routes/projectRoutes')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/api/tasks', tasksRouter)
app.use('/api/projects', projectsRouter)

app.get('/', (req, res) => res.json({ ok: true, message: 'API de tareas' }))

app.use(errorHandler)

module.exports = app
