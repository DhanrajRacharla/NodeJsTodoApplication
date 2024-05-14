const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
  }
}

initializeDbAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  const {search_q = '', status, priority} = request.query
  let getQuery = ''
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' 
       AND status = '${status}'
       AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' 
       AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' 
       AND status = '${status}';`
      break
    default:
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' ;`
      break
  }
  const getQueryResponse = await db.all(getQuery)
  response.send(getQueryResponse)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getSpecifiIdQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const getSpecifiIdQueryResponse = await db.get(getSpecifiIdQuery)
  response.send(getSpecifiIdQueryResponse)
})

app.post('/todos/', async (request, response) => {
  const postDetails = request.body
  const {id, todo, priority, status} = postDetails
  const postQuery = `INSERT INTO todo(id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`
  const postQueryResponse = await db.run(postQuery)
  response.send('Todo Successfully Added')
})

const updateStatus = requestQuery => {
  return requestQuery.status !== undefined
}
const updatePriority = requestQuery => {
  return requestQuery.priority !== undefined
}

app.put('/todos/:todoId', async (request, response) => {
  const putDetails = request.body
  const {todoId} = request.params
  const {status, priority, todo} = putDetails
  let putQuery = ''
  let responseText = ''

  switch (true) {
    case updateStatus(putDetails):
      putQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId}; `
      responseText = 'Status Updated'
      break
    case updatePriority(putDetails):
      putQuery = `UPDATE todo SET priority = '${priority}'; `
      responseText = 'Priority Updated'
      break
    default:
      putQuery = `UPDATE todo SET todo = '${todo}'; `
      responseText = 'Todo Updated'
      break
  }
  const putQueryResponse = await db.run(putQuery)
  response.send(responseText)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`
  const deleteQueryResponse = await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app;