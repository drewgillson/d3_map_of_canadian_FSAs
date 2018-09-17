import faunadb from 'faunadb'

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

// Create the FSAs index in FaunaDB if it doesn't already exist
client.query(q.Create(q.Ref("classes"), { name: "fsas" }))
  .then(()=>{
    return client.query(
      q.Create(q.Ref("indexes"), {
        name: "all_fsas",
        source: q.Ref("classes/fsas")
      }))
}).catch((e) => {
  if (e.requestResult.statusCode === 400 && e.message === 'instance not unique') {
    console.log(e)
    // index already exists
  }
})

exports.handler = (event, context, callback) => {
  const data = JSON.parse(event.body)
  console.log(data);
  const dbItem = {
    data: data
  }
  return client.query(q.Create(q.Ref("classes/fsas"), dbItem))
  .then((response) => {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(response)
    })
  }).catch((error) => {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify(error)
    })
  })
}