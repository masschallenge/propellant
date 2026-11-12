import type { APIRoute } from 'astro';
import { llmsFull } from '../brand/llms';
import { llmsSite, textResponse } from '../brand/llms-source';

export const GET: APIRoute = async ({ site }) => textResponse(llmsFull(await llmsSite(site)));
