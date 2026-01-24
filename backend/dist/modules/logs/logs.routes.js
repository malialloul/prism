"use strict";
// src/modules/logs/logs.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logs_controller_1 = require("./logs.controller");
const router = (0, express_1.Router)();
router.post('/error', logs_controller_1.logErrorHandler);
exports.default = router;
//# sourceMappingURL=logs.routes.js.map