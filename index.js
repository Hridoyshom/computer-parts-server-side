const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jmfen.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();
        const partsCollection = client.db('computer_parts').collection('parts')
        const ordersCollection = client.db('computer_parts').collection('orders')

        app.get('/part', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });
        app.get('/single-part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const cursor = await partsCollection.findOne(query);
            console.log(cursor);

            res.send(cursor);



        });

        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
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
