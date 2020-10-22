/* eslint-disable import/extensions */
import Router from 'express';
import * as usersController from '../controllers/usersController.js';
import * as verifyUsers from '../middleware/verifyUsers.js';
import * as appointmentsController from '../controllers/appointmentsController.js';

const router = Router();

/// USER ROUTES ///
router.post('/', usersController.userCreate);
router.get('/:userId/search', verifyUsers.validJWTNeeded, usersController.searchHost);
router.post('/login', verifyUsers.hasAuthValidField, usersController.userLogin);
router.get('/:userId', verifyUsers.validJWTNeeded, usersController.getUserById);
router.patch('/:userId', verifyUsers.validJWTNeeded, usersController.patchUserById);
router.post('/:userId/logout', verifyUsers.validJWTNeeded, usersController.userLogout);
router.post('/:userId/logoutall', verifyUsers.validJWTNeeded, usersController.userLogoutAll);

/// APPOINTMENTS ROUTES ///
// hostId is the userId of the host
router.get('/:userId/appointments', verifyUsers.validJWTNeeded, appointmentsController.getAllAppointments);
router.post('/:userId/appointment/create/:hostId', verifyUsers.validJWTNeeded, appointmentsController.createAppointment);
router.patch('/:userId/appointment/:appointmentId/change', verifyUsers.validJWTNeeded, appointmentsController.patchAppointmentById);
router.delete('/:userId/appointment/:appointmentId/cancel', verifyUsers.validJWTNeeded, appointmentsController.deleteAppointmentById);
router.get('/:userId/unavailableTime/:hostId', verifyUsers.validJWTNeeded, usersController.getUnavailableEventsInInterval);

export default router;
