/* eslint-disable no-param-reassign */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dateFns from 'date-fns';
import Users from '../models/Users.js';
import Hosts from '../models/Hosts.js';

const START_OFFICE_HOUR = 9;
const END_OFFICE_HOUR = 16;

export async function getUnavailableEventsInInterval(req, res) {
  try {
    const startInterval = dateFns.parseISO(req.query.startDate);
    const endInterval = dateFns.parseISO(req.query.endDate);
    const dateOfInterval = dateFns
      .eachDayOfInterval({ start: startInterval, end: endInterval });
    const user = await Users.findById(req.params.hostId).populate('_host').populate('appointments');
    const { unavailableTime } = user._host;
    // console.log(user.appointments);
    const alreadyBookedTime = user.appointments.filter((app) => app.isApproved);
    // console.log(alreadyBookedTime);

    const data = [];
    dateOfInterval.forEach((date) => {
      if (unavailableTime !== undefined) {
        // add unavailable time of host
        const dayOfWeek = dateFns.getDay(date);
        switch (dayOfWeek) {
          case 1:
            if (unavailableTime.Monday.Morning) {
              data.push({
                startDate: dateFns.setHours(date, 9),
                endDate: dateFns.setHours(date, 12),
              });
            }
            if (unavailableTime.Monday.Afternoon) {
              data.push({
                startDate: dateFns.setHours(date, 13),
                endDate: dateFns.setHours(date, 16),
              });
            }
            break;
          case 2:
            if (unavailableTime.Tuesday.Morning) {
              data.push({
                startDate: dateFns.setHours(date, 9).toISOString(),
                endDate: dateFns.setHours(date, 12).toISOString(),
              });
            }
            if (unavailableTime.Tuesday.Afternoon) {
              data.push({
                startDate: dateFns.setHours(date, 13).toISOString(),
                endDate: dateFns.setHours(date, 16).toISOString(),
              });
            }
            break;
          case 3:
            if (unavailableTime.Wednesday.Morning) {
              data.push({
                startDate: dateFns.setHours(date, 9).toISOString(),
                endDate: dateFns.setHours(date, 12).toISOString(),
              });
            }
            if (unavailableTime.Wednesday.Afternoon) {
              data.push({
                startDate: dateFns.setHours(date, 13).toISOString(),
                endDate: dateFns.setHours(date, 16).toISOString(),
              });
            }
            break;
          case 4:
            if (unavailableTime.Thursday.Morning) {
              data.push({
                startDate: dateFns.setHours(date, 9).toISOString(),
                endDate: dateFns.setHours(date, 12).toISOString(),
              });
            }
            if (unavailableTime.Thursday.Afternoon) {
              data.push({
                startDate: dateFns.setHours(date, 13).toISOString(),
                endDate: dateFns.setHours(date, 16).toISOString(),
              });
            }
            break;
          case 5:
            if (unavailableTime.Friday.Morning) {
              data.push({
                startDate: dateFns.setHours(date, 9).toISOString(),
                endDate: dateFns.setHours(date, 12).toISOString(),
              });
            }
            if (unavailableTime.Friday.Afternoon) {
              data.push({
                startDate: dateFns.setHours(date, 13).toISOString(),
                endDate: dateFns.setHours(date, 16).toISOString(),
              });
            }
            break;
          default:
            break;
        }
      }

      // add non-office hour events
      data.push({
        startDate: dateFns.setMinutes(dateFns.setHours(date, 0), 1).toISOString(),
        endDate: dateFns
          .setMinutes(dateFns.setHours(date, START_OFFICE_HOUR - 1), 59).toISOString(),
      });
      data.push({
        startDate: dateFns.setMinutes(dateFns.setHours(date, 12), 1).toISOString(),
        endDate: dateFns.setMinutes(dateFns.setHours(date, 12), 59).toISOString(),
      });
      data.push({
        startDate: dateFns.setMinutes(dateFns.setHours(date, END_OFFICE_HOUR), 1).toISOString(),
        endDate: dateFns.setMinutes(dateFns.setHours(date, 23), 59).toISOString(),
      });
    });

    // add already booked time
    alreadyBookedTime.forEach((appointment) => {
      if (dateFns.isAfter(appointment.startTime, startInterval)
        && dateFns.isBefore(appointment.startTime, endInterval)) {
        data.push({
          startDate: appointment.startTime.toISOString(),
          endDate: appointment.endTime.toISOString(),
        });
      }
    });
    // console.log(data);

    res.status(200).send(data);
  } catch (e) {
    // console.log('in getUnavailableTimeInInterval', e);
    res.status(400).send({ error: 'cant get resource' });
  }
}

export async function searchHost(req, res, next) {
  const hostName = req.query.name.toLowerCase();
  if (hostName.length === 0) {
    res.status(400).send({ error: 'empty query' });
    next();
  }
  try {
    const data = await Users.fuzzySearch(hostName);
    const results = [];
    data.filter((e) => e._host !== null && e._host !== undefined).forEach((e) => {
      const {
        _id, name, email, _host, ...rest
      } = e;
      results.push({
        _id, name, email, _host,
      });
    });
    if (results.length === 0) throw new Error('did not find any results');
    res.status(200).send(results);
  } catch (e) {
    console.error(e);
    res.status(400).send(e);
  }
}

// TODO: modify with Host
export async function patchUserById(req, res) {
  await Users.findById(req.params.userId, (error, user) => {
    if (req.body.name.length !== 0) user.name = req.body.name;
    if (req.body.email.length !== 0) user.email = req.body.email;
    if (req.body.password.length !== 0) user.password = req.body.password;
    user.save((err, result) => {
      if (err) res.status(400).send(err);
      result.password = undefined;
      result.tokens = undefined;
      res.status(200).send(result);
    });
  });
}

export async function userLogoutAll(req, res) {
  // Log user out of all devices
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function userLogout(req, res) {
  // Logout user out of the app
  try {
    req.user.token = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    // console.log('in userLogout', e.message);
    res.status(500).send(e);
  }
}

export async function userCreate(req, res) {
  // Create a new user and send back location w/ token
  try {
    if (req.body._host === true) {
      req.body._host = new Hosts();
      await req.body._host.save();
    }
    const user = new Users(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    // TODO: remove user from res
    // delete password and tokens from response
    user.password = undefined;
    user.tokens = undefined;
    res.status(201).location(`${user._id}`).send({
      user,
      token,
    });
  } catch (e) {
    // console.log('in userCreate', e.message);
    res.status(400).send({ error: 'at userCreate', e });
  }
}

export async function userLogin(req, res) {
  // Login a registered user
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // console.log(`${email} .. ${password}`);
    const user = await Users.findByCredentials(email, password);
    if (!user) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
    }
    const token = await user.generateAuthToken();
    // console.log(token);
    // delete password and tokens from response
    user.password = undefined;
    user.tokens = undefined;
    res.status(200).location(`${user._id}`).send({
      user,
      token,
    });
  } catch (error) {
    // console.log('in userLogin', error);
    res.status(400).send({ err: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const result = await Users.findById(req.params.userId);
    result.tokens = undefined;
    result.password = undefined;
    // console.log(result);
    res.status(200).send(result);
  } catch (error) {
    // console.log('in getUSErbyID', error.message);
    res.status(400).send(error);
  }
}
