const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2rm9pnz.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const userCollection = client.db("taskManagerDb").collection("users");
        const taskCollection = client.db("taskManagerDb").collection("tasks");




        app.get('/user/currentUser', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await userCollection.find(query).toArray();
            res.send(result);

        });



        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })





        app.post('/addTask', async (req, res) => {
            const item = req.body;
            const result = await taskCollection.insertOne(item);
            res.send(result)
        })




        app.get('/allTasks', async (req, res) => {
            try {
                const result = await taskCollection.find().toArray();
                // console.log(result); 
                res.send(result);
            } catch (error) {
                console.error("Error fetching posts:", error);
                res.status(500).send("Error fetching posts");
            }
        });


        app.patch('/allTask/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            console.log(filter);
            const options = { upsert: true };
            const updateStatus = req.body;
            console.log(updateStatus);
            const updateTaskStatus = {
                $set: {
                    status: updateStatus.newStatus,


                }
            }
            const result = await taskCollection.updateOne(filter, updateTaskStatus, options)
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





app.get('/', (req, res) => {
    res.send('Task management server is running')
})

app.listen(port, () => {
    console.log(`Task management is running in port: ${port}`);
})