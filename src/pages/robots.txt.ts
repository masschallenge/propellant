import type { APIRoute } from 'astro';
import { robotsText } from '../brand/llms';
import { requireSite, textResponse } from '../brand/llms-source';

export const GET: APIRoute = ({ site }) => textResponse(robotsText(requireSite(site).origin));
