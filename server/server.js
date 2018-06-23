const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Todo, User } = require('./db/models');

const app = express();
const port = process.env.PORT || 3000;

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
			console.log('Not valid id');
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
app.delete('/todos/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!ObjectID.isValid(id)) {
			console.log('Not valid id');
			return res.status(404).send();
		}
		const todo = await Todo.findByIdAndRemove(id);
		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });
	} catch (e) {
		res.status(400).send(e);
	}
});

app.patch('/todos/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const body = _.pick(req.body, [ 'text', 'completed' ]);
		if (!ObjectID.isValid(id)) {
			console.log('Not valid id');
			return res.status(404).send();
		}
		if (_.isBoolean(body.completed) && body.completed) {
			body.completedAt = new Date().getTime();
		} else {
			body.completed = false;
			body.completedAt = null;
		}

		const todo = await Todo.findByIdAndUpdate(id, { $set: body }, { new: true });

		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });
	} catch (e) {
		res.status(400).send(e);
	}
});

app.listen(port, () => {
	console.log(`Started up at port ${port}`);
});
