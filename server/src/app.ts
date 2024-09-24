import express from "express";
import cors from "cors";
import morgan from 'morgan'

import * as Utils from './utils'

interface ClientKeys {
  publicKey?: string
}



const PORT = 8080;
const app = express();
const database = { data: "HelloWorld", timestamp: Date.now() };
const clientKeys: ClientKeys = { publicKey: undefined }

app.use(cors());
app.use(express.json());
app.use(morgan('dev'))

app.get("/", (req, res) => {
  const publicKey = req.headers['x-public-key']
  
  if (!publicKey) return res.status(400).send('Public Key Required')
  clientKeys.publicKey = publicKey as string
  const hash = Utils.generateHash(database.data)
  res.status(200).json({ data: database.data, hash });
});

app.put("/", (req, res) => {
  const publicKey = req.headers['x-public-key']
  
  if (!publicKey) return res.status(400).send('Public Key Required')
  const { data } = req.body
  database.data = data;
  database.timestamp = Date.now()
  clientKeys.publicKey = publicKey as string
  const hash = Utils.generateHash(data)
  res.status(201).json({ data, hash });
});

app.get('/verify', (req, res) => {
  res.status(200).json({ publicKey: clientKeys.publicKey })
})

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
