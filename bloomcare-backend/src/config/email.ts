import { Resend } from 'resend';
import { environment } from './enviroment';
import { logger } from './logger';

const resend = new Resend(environment.RESEND_API_KEY);

logger.info('Resend email client ready');

export { resend };