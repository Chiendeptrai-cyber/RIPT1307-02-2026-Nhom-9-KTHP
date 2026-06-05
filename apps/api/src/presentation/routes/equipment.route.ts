import { Router } from 'express';
import {
  listEquipment,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipment.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize }    from '../middlewares/authorize.middleware';
import { UserRole } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();

router.get('/', listEquipment);
router.get('/:id', getEquipmentDetail);

// Admin only routes
router.post('/', authenticate, authorize(UserRole.ADMIN), createEquipment);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), updateEquipment);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteEquipment);

export default router;

