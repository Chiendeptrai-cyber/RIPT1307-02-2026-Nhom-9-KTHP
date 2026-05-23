import { Router } from 'express';
import { listEquipment, getEquipmentDetail } from '../controllers/equipment.controller';

const router: import('express').Router = Router();
router.get('/', listEquipment);
router.get('/:id', getEquipmentDetail);

export default router;
