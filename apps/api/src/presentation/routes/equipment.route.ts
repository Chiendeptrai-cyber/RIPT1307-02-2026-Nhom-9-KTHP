import { Router } from 'express';
import {

  listEquipment, getEquipmentDetail, createEquipment,
  updateEquipment, deleteEquipment, stockAdjustment, changeEquipmentStatus,listCategories, createCategory,

} from '../controllers/equipment.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize }    from '../middlewares/authorize.middleware';
import { UserRole }     from '@equipment-mgmt/shared';

const router: import('express').Router = Router();

// Public
router.get('/', listEquipment);
router.get('/categories', listCategories);
router.post('/categories', authenticate, authorize(UserRole.ADMIN), createCategory);
router.get('/:id', getEquipmentDetail);

// Admin only
router.post('/',                        authenticate, authorize(UserRole.ADMIN), createEquipment);
router.patch('/:id',                    authenticate, authorize(UserRole.ADMIN), updateEquipment);
router.delete('/:id',                   authenticate, authorize(UserRole.ADMIN), deleteEquipment);
router.patch('/:id/stock-adjustment',   authenticate, authorize(UserRole.ADMIN), stockAdjustment);
router.patch('/:id/change-status',      authenticate, authorize(UserRole.ADMIN), changeEquipmentStatus);

export default router;
