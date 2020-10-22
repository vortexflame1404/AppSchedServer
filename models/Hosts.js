import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const hostModel = new Schema({
  unavailableTime: {
    type: {},
    default: {
      Monday: { Morning: false, Afternoon: false },
      Tuesday: { Morning: false, Afternoon: false },
      Wednesday: { Morning: false, Afternoon: false },
      Thursday: { Morning: false, Afternoon: false },
      Friday: { Morning: false, Afternoon: false },
    },
  },
});

const Hosts = model('Hosts', hostModel);
export default Hosts;
