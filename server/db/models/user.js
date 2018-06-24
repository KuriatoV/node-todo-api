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
UserSchema.methods.removeToken = async function(token) {
	const user = this;
	console.log('here =====');
	try {
		const result = await user.update({ $pull: { tokens: { token } } });
		console.log('result', result);

		return result;
	} catch (e) {
		return Promise.reject();
	}
};
UserSchema.statics.findByToken = async function(token) {
	const User = this;
	let decoded;
	try {
		decoded = await jwt.verify(token, 'abc123');

		const user = await User.findOne({
			_id: decoded._id,
			'tokens.token': token,
			'tokens.access': 'auth'
		});
		return user;
	} catch (e) {
		return Promise.reject();
	}
};

UserSchema.statics.findByCredentials = async function({ email, password }) {
	const User = this;
	let user;
	try {
		user = await User.findOne({ email });
		if (user) {
			if (bcrypt.compare(password, user.password)) {
				return user;
			}
		}
	} catch (e) {
		Promise.reject();
	}
};

UserSchema.pre('save', function(next) {
	const user = this;
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hashedPassword) => {
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
