"use strict";
// src/modules/logs/logs.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErrorHandler = void 0;
const logs_service_1 = require("./logs.service");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.logErrorHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const logId = await (0, logs_service_1.logClientError)(req.body);
    res.status(201).json({
        success: true,
        id: logId,
    });
});
//# sourceMappingURL=logs.controller.js.map