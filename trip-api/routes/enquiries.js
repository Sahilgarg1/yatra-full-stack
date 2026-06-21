const express = require("express");
const router = express.Router();
const { validateBody, EnquiryBodySchema } = require("../middleware/validate");
const { createEnquiry } = require("../services/enquiries");

// POST /enquiries
// Submit an enquiry for a trip — logs it and returns WhatsApp/source URL for redirect
router.post("/", validateBody(EnquiryBodySchema), async (req, res, next) => {
  try {
    const result = await createEnquiry(req.validatedBody);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
