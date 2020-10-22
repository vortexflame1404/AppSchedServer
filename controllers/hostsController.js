import Users from '../models/Users.js';
import Hosts from '../models/Hosts.js';

export const setHostUnavailableTime = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).populate('_host').exec();
    // console.log(user._host.id);
    // eslint-disable-next-line max-len
    user._host.unavailableTime = req.body;
    user._host.markModified('unavailableTime');
    // console.log(user._host.unavailableTime);
    await user._host.save();
    const result = await user.save();
    // console.log(result._host);
    res.status(201).send(user._host.unavailableTime);
  } catch (e) {
    // console.log('in setUnavaTime', e.message);
    res.status(400).send({ error: 'in controller' });
  }
};

export const getHostUnavailableTime = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).populate('_host').exec();
    // console.log(user);
    res.status(200).send(user._host.unavailableTime);
  } catch (e) {
    res.status(400).send({ error: 'in getHostUnavailableTime' });
  }
};
