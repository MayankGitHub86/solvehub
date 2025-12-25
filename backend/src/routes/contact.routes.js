const { Router } = require('express');
const contactController = require('../controllers/contact.controller');

const router = Router();

// Contact form submission
router.post('/send', contactController.sendContactEmail);

// Newsletter subscription
router.post('/subscribe', contactController.subscribeNewsletter);

module.exports = router;
