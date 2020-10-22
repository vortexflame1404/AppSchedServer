/* eslint-disable import/extensions */
import dateFns from 'date-fns';
import Appointments from '../models/Appointments.js';
import Users from '../models/Users.js';

// TODO: test again w/ delete
export async function deleteAppointmentById(req, res) {
  try {
    const { appointmentId } = req.params;
    const { _host, _guest } = await Appointments.findById(req.params.appointmentId, '_host _guest').exec();
    const results = await Appointments.deleteOne({ _id: appointmentId });
    if (results.deletedCount === 0) throw new Error('cannot find appointment');
    const host = await Users.findById(_host);
    const user = await Users.findById(_guest);
    host.appointments = host.appointments.filter((appointment) => appointment !== appointmentId);
    user.appointments = user.appointments
      .filter((appointment) => appointment !== appointmentId);
    await user.save();
    await host.save();
    res.status(200).send({});
  } catch (e) {
    // console.log('in cancalAppointment', e);
    res.status(400).send({ error: "can't cancel appointment" });
  }
}

export async function patchAppointmentById(req, res) {
  try {
    const appointment = await Appointments.findById(req.params.appointmentId);
    if (req.body.title.length !== 0) appointment.title = req.body.title;
    if (req.body.details.length !== 0) appointment.details = req.body.details;
    if (req.body.startTime !== 0) appointment.startTime = dateFns.parseISO(req.body.startDate);
    appointment.isApproved = req.body.isApproved;
    await appointment.save();
    // console.log(appointment);
    res.status(200).send({});
  } catch (e) {
    // console.log('in patchApp by id', e);
    res.status(400).send(e.message);
  }
}

export async function getAllAppointments(req, res) {
  try {
    const results = await Users.findById((req.params.userId))
      .populate({
        path: 'appointments',
        populate: [{
          path: '_host',
          select: 'name',
        }, {
          path: '_guest',
          select: 'name',
        }],
      });
    const now = new Date();
    results.appointments = results.appointments.filter((app) => dateFns.isAfter(app.startTime, now));
    res.status(200).send(results.appointments);
  } catch (e) {
    console.error('in getallappointments', e);
    res.status(400).send({});
  }
}

export async function approveAppointment(req, res) {
  try {
    const results = await Appointments.findById(req.params.id);
    results.isApproved = true;
    await results.save();
    res.status(200).send(results);
  } catch (e) {
    // console.log('approve appointments', e);
    res.status(400).send(e);
  }
}

export async function createAppointment(req, res) {
  const time = dateFns.parseISO(req.body.startTime);
  const now = new Date();
  // console.log(new Date());
  try {
    const checkIfExisted = Appointments.find({
      startTime: time,
      _host: req.params.hostId,
    })
      .exec();
    if (dateFns.isBefore(time, now)) throw new Error("can't go back time");
    if (checkIfExisted.length > 0) throw new Error('already pending appointment');
    const appointment = new Appointments({
      title: req.body.title,
      details: req.body.details,
      startTime: time,
      _host: req.params.hostId,
      _guest: req.params.userId,
      isApproved: false,
    });
    // console.log(appointment);
    const user = await Users.findById(req.params.userId);
    const host = await Users.findById(req.params.hostId);
    user.appointments.push(appointment._id);
    host.appointments.push(appointment._id);
    await appointment.save();
    await user.save();
    await host.save();
    // console.log('print appointment', appointment);
    res.status(201).send(appointment);
  } catch (e) {
    // console.log('createAppointment', e);
    res.status(400).send(e);
  }
}
