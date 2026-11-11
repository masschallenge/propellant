import type { APIRoute } from 'astro';
import { llmsIndex } from '../brand/llms';
import { llmsSite, textResponse } from '../brand/llms-source';

export const GET: APIRoute = async ({ site }) => textResponse(llmsIndex(await llmsSite(site)));
