import { Router, text } from 'express';
import { 
  handleApnaWebhook, 
  handleApnaEmailWebhook,
  handleNaukriWebhook, 
  handleLinkedInWebhook, 
  handleLinkedInEmailWebhook, 
  handleIndeedWebhook, 
  handleCareersApply 
} from '../controllers/webhookController.js';

const router = Router();

// Structured Webhooks
router.post('/webhook/apna', handleApnaWebhook);
router.get('/webhook/apna', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Apna Candidate Webhook Ingestion Gateway',
    timestamp: new Date().toISOString(),
    supportedMethods: ['POST', 'GET']
  });
});
router.post('/webhook/naukri', handleNaukriWebhook);
router.post('/webhook/linkedin', handleLinkedInWebhook);
router.post('/webhook/indeed', handleIndeedWebhook);

// Raw Inbound Email Webhooks (for SendGrid / Mailgun / Postmark / Gmail forwarder / Google Apps Script)
router.post('/webhook/apna-email', text({ type: '*/*' }), handleApnaEmailWebhook);
router.post('/webhook/apna-email-json', handleApnaEmailWebhook);
router.post('/webhook/linkedin-email', text({ type: '*/*' }), handleLinkedInEmailWebhook);

// Direct Careers Application
router.post('/careers/apply', handleCareersApply);

export default router;
