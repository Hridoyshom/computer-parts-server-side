const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jmfen.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' })
    }
}


async function run() {

    try {
        await client.connect();
        const partsCollection = client.db('computer_parts').collection('parts')
        const ordersCollection = client.db('computer_parts').collection('orders')
        const userCollection = client.db('computer_parts').collection('users')

        app.get('/part', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        // app.put('/user/admin/:email', async (req, res) => {
        //     const email = req.params.email;

        //     const filter = { email: email };

        //     const updateDoc = {
        //         $set: { role: 'admin' },
        //     };
        //     const result = await userCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
            res.send({ result, token: token });
        });

        app.get('/single-part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const cursor = await partsCollection.findOne(query);
            console.log(cursor);

            res.send(cursor);



        });

        app.get('/order', verifyJWT, async (req, res) => {
            const buyerEmail = req.query.buyerEmail;
            // const authorization = req.headers.authorization;
            console.log('auth header', authorization);
            const query = { buyerEmail: buyerEmail };
            const orders = await ordersCollection.find(query).toArray();

            res.send(orders);
        })

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        app.post('/order', async (req, res) => {
            const order = req.body;

            const result = await ordersCollection.insertOne(order);
            res.send(result);

        })
    }
    finally {

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Computer PArts')
})

app.listen(port, () => {
    console.log(`Computer Parts ${port}`)
})
