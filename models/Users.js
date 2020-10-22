import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongooseFuzzySearch from 'mongoose-fuzzy-searching';

/**
 * Do not declare methods using ES6 arrow functions (=>). Arrow functions explicitly prevent
 * binding "this", so your method will not have access to the document and the above examples
 * will not work.
 */

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: 'Invalid Email address' });
      }
    },
  },
  password: {
    type: String, required: true, minLength: 7, trim: true,
  },
  _host: { type: Schema.Types.ObjectId, ref: 'Hosts' },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointments' }],
});

userSchema.plugin(mongooseFuzzySearch, {
  fields: ['name'],
  middlewares: {
    async preSave() {
      // Hash the password before saving the user model
      const user = this;
      if (user.isModified('password')) {
        await bcrypt.hash(user.password, 10)
          .then((hashedPassword) => {
            user.password = hashedPassword;
          })
          .catch((onerror) => {
            throw new Error(onerror);
          });
      }
    },
  },
});

userSchema.methods.generateAuthToken = async function () {
  // Generate an verifyUsers token for the user
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: '2 days' });
  this.tokens = this.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async function (inputEmail, password) {
  // Search for a user by email and password.
  // eslint-disable-next-line no-use-before-define
  const user = await Users.findOne({ email: inputEmail });
  if (!user) {
    throw new Error({ error: 'Invalid login credentials' });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  // console.log(isPasswordMatch);
  if (!isPasswordMatch) {
    throw new Error({ error: 'Invalid login credentials' });
  }
  return user;
};

// userSchema.statics.findHost = async function (name) {};

const Users = model('Users', userSchema);

export default Users;
