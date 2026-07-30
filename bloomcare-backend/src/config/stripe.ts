import Stripe from "stripe";
import { environment } from "./enviroment";
import { logger } from "./logger";

export const stripe: Stripe = new Stripe(
  environment.STRIPE_SECRET_KEY || "dummy_key"
);

logger.info("Stripe configured successfully");