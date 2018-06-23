const MongoClient=require('mongodb');
const dbName='TodoApp'
MongoClient.connect(`mongodb://localhost:27017/${dbName}`,(err,client)=>{
    if (err){
        return console.log('Unable to connect to MongoDB server')
    }
        console.log('Succesfully connected to MongoDB');
    const db=client.db(dbName);
        db.collection('Todos').insertOne({lol:1},(err,result)=>{
        if (err){
            return console.log('Unable to insert Todo',err)
        }
        console.log(JSON.stringify(result.ops))
    })
    client.close();
});