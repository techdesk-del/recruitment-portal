import { Router, text } from 'express';
import { 
  handleApnaWebhook, 
  handleNaukriWebhook, 
  handleLinkedInWebhook, 
  handleLinkedInEmailWebhook, 
  handleIndeedWebhook, 
  handleCareersApply 
} from '../controllers/webhookController.js';

const router = Router();

// Structured Webhooks
router.post('/webhook/apna', handleApnaWebhook);
router.post('/webhook/naukri', handleNaukriWebhook);
router.post('/webhook/linkedin', handleLinkedInWebhook);
router.post('/webhook/indeed', handleIndeedWebhook);

// Raw Inbound Email Webhook (for SendGrid / Mailgun / Postmark / Gmail forwarder)
router.post('/webhook/linkedin-email', text({ type: '*/*' }), handleLinkedInEmailWebhook);

// Direct Careers Application
router.post('/careers/apply', handleCareersApply);

export default router;
