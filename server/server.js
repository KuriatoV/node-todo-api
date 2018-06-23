const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo, User } = require('./db/models');

const app = express();
app.use(bodyParser.json());

app.post('/todos', async (req, res) => {
	const todo = new Todo({
		text: req.body.text
	});
	try {
		const document = await todo.save();
		res.send(document);
	} catch (e) {
		res.status(400).send(e);
	}
});
app.get('/todos', async (req, res) => {
	try {
		const todos = await Todo.find({});
		res.send({ todos });
	} catch (err) {
		res.status(400).send(err);
	}
});
app.get('/todos/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!ObjectID.isValid(id)) {
			console.log('not valid');
			return res.status(404).send();
		}
		const todo = await Todo.findById(id);
		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });
	} catch (e) {
		res.status(400).send(e);
	}
});

app.listen(3000, () => {
	console.log('Started on port 3000');
});
