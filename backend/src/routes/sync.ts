import { Router } from "express"
import { SyncController } from "../controller/sync.controller"

const router = Router()

// Sync data from extension
router.post("/", SyncController.syncData)

export default router

