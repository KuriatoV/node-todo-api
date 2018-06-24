const { User } = require('../db/models');

const authenticate = async (req, res, next) => {
	const token = req.header('x-auth');
	let user;
	try {
		user = await User.findByToken(token);
	} catch (e) {
		return res.status(401).send();
	}
	if (!user) {
		return res.status(401).send();
	}
	req.user = user;
	req.token = token;

	next();
};

module.exports = { authenticate };
