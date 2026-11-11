import type { APIRoute } from 'astro';
import { robotsText } from '../brand/llms';
import { textResponse } from '../brand/llms-source';

export const GET: APIRoute = ({ site }) => textResponse(robotsText(site?.origin ?? ''));
