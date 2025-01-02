// hSiq86vUIRLxN1PU
// Assignment-11
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5500;

// mIDDLEWARE

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stupendous-semifreddo-aa16f7.netlify.app",
      "https://verdant-bonbon-417997.netlify.app",
    ],
    credentials: true,
    optionalSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());

//  verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    console.log(token);
    next(); 
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avdh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const AddMarathonData = client
      .db("AddMarathonDB")
      .collection("AllMarathonData");
    const MarathonApplyData = client
      .db("AddMarathonDB")
      .collection("MarathonApplyData");

    // generate jwt
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: "365d",
      });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

    })
        .send({ success: true });
    });

    //  logOut clear cookie
    app.get("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    //   res.clearCookie('token', {
    //     maxAge: 0,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

    //     // path: '/'
    //   }).send({ success: true })
    // })
    //  app.get('/logout' , async(req , res)=>{
    //    res.clearCookie('token' , {
    //     maxAge: 0,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    //    }).send({ success: true })
    // })
    // app.post('/jwt' , async(req , res) =>{
    //   const email =req.body;
    //   // create token
    //   const token = jwt.sign(email , process.env.SECRET_KEY,{expiresIn:"24h"}) ;
    //   console.log(token);

    //   res.cookie('token' , token,{
    //     httpOnly: true,
    //     secure:process.env.NODE_ENV ==='production',
    //     sameSite:process.env.NODE_ENV === '   production' ? 'none' : 'strict',
    //   })

    // })

    // Server Side Data Store

    app.get("/addMarathon", async (req, res) => {
      const dataStore = AddMarathonData.find();
      const result = await dataStore.toArray();
      res.send(result);
    });

    // My List Data Specific email

    app.get("/addMarathon/:email", verifyToken, async (req, res) => {
      const decodedEmail = req.user?.email;
      const email = req.params.email;
      console.log("decoded email : " , decodedEmail);
      console.log("email" , email);
      if (decodedEmail !== email)
        return res.status(401).send({ message: "unauthorized token access" });
      const filter = { post_email: email };
      const result = await AddMarathonData.find(filter).toArray();
      res.send(result);
    });
    //  My List Data Delete

    app.delete("/addMarathon/:id", async (req, res) => {
      const SpecificId = req.params.id;
      const filter = { _id: new ObjectId(SpecificId) };
      const result = await AddMarathonData.deleteOne(filter);
      res.send(result);
    });

    app.post("/addMarathon", async (req, res) => {
      const newMarathonData = req.body;
      const result = await AddMarathonData.insertOne(newMarathonData);
      res.send(result);
    });

    //

    // home page cards store
    // Server Side Data Store
    app.get("/homeMarathonSixCards", async (req, res) => {
      const dataStore = AddMarathonData.find();
      const result = await dataStore.toArray();
      res.send(result);
    });

    // home page 6cards limit()

    app.get("/homeMarathonSixCards", async (req, res) => {
      const marathonCard = await AddMarathonData.find().limit(6).toArray();
      res.send(marathonCard);
    });

    // apply marathon server side save
    app.get("/applyMarathon/:email", verifyToken, async (req, res) => {
      const decodedEmail = req.user?.email;
      const search = req.query.search;
      const email = req.params.email;

      if (decodedEmail !== email)
        return res.status(401).send({ message: "unauthorized token access" });

      let filter = { applyEmail: email };
      if (search) {
        filter.marathonTitle = { $regex: search, $options: "i" };
      }

      const result = await MarathonApplyData.find(filter).toArray();
      res.send(result);
    });

    //   const search = req.query.search;
    //   console.log(search);
    //  let query = {
    //   firstName:{
    //     $regex:search ,
    //     $options:'i'
    //   }
    //  }
    //   // if(filterSearch) query.marathonTitle = filterSearch ;
    //   const email = req.params.email ;
    //   const filter = {applyEmail : email } ;
    //   const result = await MarathonApplyData.find(filter ).toArray() ;
    //   res.send(result)
    // })

    // apply Marathon delete
    app.delete("/applyMarathon/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await MarathonApplyData.deleteOne(filter);
      res.send(result);
    });

    // applyMarathon data store
    app.get("/applyMarathon", async (req, res) => {
      const dataStore = MarathonApplyData.find();
      const result = await dataStore.toArray();
      res.send(result);
    });

    // apply Marathon
    app.post("/applyMarathon", async (req, res) => {
      const newApply = req.body;
      const result = await MarathonApplyData.insertOne(newApply);

      //
      // increase apply data
      const filter = { _id: new ObjectId(newApply.marathonApplyId) };
      const update = {
        $inc: { total_count: 1 },
      };

      await AddMarathonData.updateOne(filter, update);

      res.send(result);
    });

    // apply marathon update
    app.put("/UpdateApplyMarathon/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const UpdateApplyMarathon = req.body;

      const update = {
        $set: {
          title: UpdateApplyMarathon.title,
          firstName: UpdateApplyMarathon.firstName,
          lastName: UpdateApplyMarathon.lastName,
          contactNumber: UpdateApplyMarathon.contactNumber,
        },
      };
      const result = await MarathonApplyData.updateOne(filter, update);
      res.send(result);
    });

    // add marathon data update
    app.put("/UpdateMarathon/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAddMarathonData = req.body;

      const update = {
        $set: {
          title: updateAddMarathonData.title,

          startRegistrationDate: updateAddMarathonData.startRegistrationDate,
          endRegistrationDate: updateAddMarathonData.endRegistrationDate,
          marathonStartDate: updateAddMarathonData.marathonStartDate,
          location: updateAddMarathonData.location,
          distance: updateAddMarathonData.distance,
          description: updateAddMarathonData.description,
          image: updateAddMarathonData.image,
        },
      };
      const result = await AddMarathonData.updateOne(filter, update);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment-11 Running");
});

app.listen(port, () => {
  console.log(`Assignment-11 is running ${port}`);
});
