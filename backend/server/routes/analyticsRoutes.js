import { Router } from 'express'
import { getActivityHeatmap } from '../controllers/analyticsController.js'

const router = Router()

router.get('/activity-heatmap', getActivityHeatmap)

export default router