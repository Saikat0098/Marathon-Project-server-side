// hSiq86vUIRLxN1PU
// Assignment-11

const express = require("express") ; 
const cors = require("cors");
require("dotenv").config();
const app = express() ; 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5500 ; 

// mIDDLEWARE

app.use(cors()) ; 
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avdh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const AddMarathonData = client.db("AddMarathonDB").collection("AllMarathonData") ; 
    const MarathonApplyData = client.db("AddMarathonDB").collection("MarathonApplyData") ; 


    // Server Side Data Store 
    app.get('/addMarathon' , async(req , res )=>{
        const dataSore = AddMarathonData.find() ; 
        const result = await dataSore.toArray() ; 
        res.send(result)
    })

    app.post('/addMarathon' , async(req , res)=>{
        const newMarathonData = req.body ; 
        const result = await AddMarathonData.insertOne(newMarathonData) ; 
        res.send(result)
    })


    // apply Marathon 
    app.post('/applyMarathon' , async(req , res ) => {
      const newApply = req.body ; 
      const result = await MarathonApplyData.insertOne(newApply)


      // increase apply data 
      const filter = {_id: new ObjectId(newApply.marathonApplyId)}
      const update = {
        $inc: {total_count: 1 }
      }

      await AddMarathonData.updateOne(filter , update )

      res.send(result)
    })

    // add marathon data update 
    app.put('/UpdateMarathon/:id' , async(req , res ) =>{
      const id = req.params.id ; 
      const filter = {_id : new ObjectId(id)} ; 
      const options = {upsert : true } ; 
      const updateAddMarathonData = req.body ;

 
      const update = {
        $set:{
          title : updateAddMarathonData.title , 
       
          startRegistrationDate : updateAddMarathonData.startRegistrationDate , 
          endRegistrationDate : updateAddMarathonData.endRegistrationDate , 
          marathonStartDate : updateAddMarathonData.marathonStartDate , 
          location : updateAddMarathonData.location ,  
          distance : updateAddMarathonData.distance , 
          description : updateAddMarathonData.description , 
          image : updateAddMarathonData.image , 

        }
       
      }
      const result = await AddMarathonData.updateOne(filter , update ) ; 
      res.send(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/" , (req , res )=>{
    res.send("Assignment-11 Running")
})

app.listen(port ,()=>{
    console.log(`Assignment-11 is running ${port}`);
})
