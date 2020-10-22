import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';

export const validJWTNeeded = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const data = await jwt.verify(token, process.env.JWT_KEY);
    let user = await Users.findOne({ _id: data._id, 'tokens.token': token });
    if (user._host) {
      user = user.populate('_host');
    }
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    // console.log('in validJwtneeded', error.message);
    res.status(401).send({ error: 'Not authorized to access this resource' });
  }
};

export const hasAuthValidField = async (req, res, next) => {
  if (!req.body.email || !req.body.password) res.status(400).send({ error: 'Missing email and password fields' });
  next();
};

export const isHost = async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.userId).exec();
    // console.log(user.name);
    if (user._host !== null && user._host !== undefined) next();
  } catch (e) {
    // console.log('in isHost middleware', e.message);
    res.status(400).send({ error: 'cannot perform this action' });
  }
};
