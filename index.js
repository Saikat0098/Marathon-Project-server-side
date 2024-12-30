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
        const dataStore = AddMarathonData.find() ; 
        const result = await dataStore.toArray() ; 
        res.send(result)
    }) ; 

    // My List Data Specific email

    app.get('/addMarathon/:email' , async(req , res ) =>{
      const email = req.params.email ; 
      const filter = {post_email : email } ; 
      const result = await AddMarathonData.find(filter).toArray() ; 
      res.send(result)
    } )
    //  My List Data Delete
    
   app.delete('/addMarathon/:id' , async(req , res )=>{
    const SpecificId = req.params.id ; 
    const filter = {_id : new ObjectId(SpecificId)}
    const result = await AddMarathonData.deleteOne(filter) ; 
    res.send(result)
   })


    app.post('/addMarathon' , async(req , res)=>{
        const newMarathonData = req.body ; 
        const result = await AddMarathonData.insertOne(newMarathonData) ; 
        res.send(result)
    })


    // home page 6cards limit()
    app.get('/homeMarathonSixCards' , async(req , res ) =>{
      const marathonCard = await AddMarathonData.find().limit(6).toArray() ; 
      res.send(marathonCard)
    }  )

    // apply marathon server side save
    app.get('/applyMarathon/:email' , async(req , res )=>{
      const email = req.params.email ; 
      const filter = {applyEmail : email } ; 
      const result = await MarathonApplyData.find(filter).toArray() ; 
      res.send(result)
    })

    // apply Marathon delete
    app.delete('/applyMarathon/:id' , async(req , res ) =>{
      const id = req.params.id ; 
      const filter = {_id : new ObjectId(id)};
      const result = await MarathonApplyData.deleteOne(filter) ; 
      res.send(result)
    })

    // applyMarathon data store 
    app.get('/applyMarathon' , async(req , res )=>{
      const dataStore = MarathonApplyData.find() ; 
      const result = await dataStore.toArray() ; 
      res.send(result)
  }) ; 


    // apply Marathon 
    app.post('/applyMarathon' , async(req , res ) => {
      const newApply = req.body ; 
      const result = await MarathonApplyData.insertOne(newApply)
 

      // 
      // increase apply data 
      const filter = {_id: new ObjectId(newApply.marathonApplyId)}
      const update = {
        $inc: {total_count: 1 }
      }

      await AddMarathonData.updateOne(filter , update )

      res.send(result)
    })

    // apply marathon update
    app.put('/UpdateApplyMarathon/:id' , async(req , res ) =>{
      const id = req.params.id ; 
      const filter = {_id : new ObjectId(id)} ; 
      const options = {upsert : true } ; 
      const UpdateApplyMarathon = req.body ;

 
      const update = {
        $set:{
          title : UpdateApplyMarathon.title , 
          firstName : UpdateApplyMarathon.firstName , 
          lastName : UpdateApplyMarathon.lastName , 
          contactNumber : UpdateApplyMarathon.contactNumber , 
          

        }
       
      }
      const result = await MarathonApplyData.updateOne(filter , update ) ; 
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
