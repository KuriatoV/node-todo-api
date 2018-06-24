const mongoose = require('mongoose');
const { isEmail } = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minLength: 1,
		unique: true,
		validate: {
			validator: isEmail
		},
		message: `{VALUE} is not a valid email`
	},
	password: {
		type: String,
		require: true,
		minlength: 6
	},
	tokens: [
		{
			access: { type: String, required: true },
			token: { type: String, required: true }
		}
	]
});

UserSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();
	return _.pick(userObject, [ '_id', 'email' ]);
};
UserSchema.methods.generateAuthToken = async function() {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();
	user.tokens.push({ access, token });
	await user.save();
	return token;
};
UserSchema.statics.findByToken = async function(token) {
	const User = this;
	let decoded;
	try {
		decoded = await jwt.verify(token, 'abc123');
	} catch (e) {
		return Promise.reject();
	}

	return await User.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.pre('save', function(next) {
	const user = this;
	console.log('user', user);
	if (user.isModified('password')) {
		console.log('user is modified', user);
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hashedPassword) => {
				console.log('hashedPassword', hashedPassword);
				user.password = hashedPassword;
				next();
			});
		});
	} else {
		next();
	}
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
