import Router from 'express';
import * as hostsController from '../controllers/hostsController.js';
import * as appointmentsController from '../controllers/appointmentsController.js';
import * as verifyUsers from '../middleware/verifyUsers.js';

const router = Router();
const forHostAction = [verifyUsers.validJWTNeeded, verifyUsers.isHost];

/// HOST ROUTES ///
router.get('/:userId/unavailableTime', forHostAction, hostsController.getHostUnavailableTime);
router.post('/:userId/unavailableTime', forHostAction, hostsController.setHostUnavailableTime);
router.post('/:userId/appointment/:appointmentId/approve', forHostAction, appointmentsController.approveAppointment);

export default router;
