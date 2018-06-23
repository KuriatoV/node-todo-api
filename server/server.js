const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./db/models/todo');
const { User } = require('./db/models/user');

const app = express();
app.use(bodyParser.json());
app.post('/todos', (req, res) => {
	const todo = new Todo({
		text: req.body.text
	});
	todo.save().then(
		(doc) => {
			res.send(doc);
		},
		(e) => {
			res.status(400).send(e);
		}
	);
});

app.listen(3000, () => {
	console.log('Started on port 3000');
});

// const user = new User({ email: ' ololo@gmail.com ' });
// user.save().then(
// 	(doc) => {
// 		console.log('Saved new  user ', doc);
// 	},
// 	(err) => {
// 		console.log('Unable to save todo');
// 	}
// );
// const newTodo = new Todo({ text: 'Cook dinner' });
// newTodo.save().then(
// 	(doc) => {
// 		console.log('Saved todo', doc);
// 	},
// 	(err) => console.log('Unable to save todo')
// );
