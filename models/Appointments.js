import mongoose from 'mongoose';
import validator from 'validator';
import dateFns from 'date-fns';

const { Schema, model } = mongoose;

const appointmentModel = new Schema({
  title: { type: String, require: true },
  details: { type: String },
  startTime: { type: Date, require: true },
  _host: { type: Schema.Types.ObjectId, ref: 'Users', require: true },
  _guest: { type: Schema.Types.ObjectId, ref: 'Users', require: true },
  isApproved: { type: Boolean, require: true },
});

appointmentModel.virtual('endTime').get(function () {
  return dateFns.addHours(this.startTime, 1);
});
appointmentModel.set('toObject', { getters: true });
appointmentModel.set('toJSON', { getters: true });

const Appointments = model('Appointments', appointmentModel);

export default Appointments;
