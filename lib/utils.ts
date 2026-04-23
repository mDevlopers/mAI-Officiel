import type {
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { DBMessage, Document } from '@/lib/db/schema';
import { extractTextFromResponsesPayload } from '@/lib/responses-text-extractor';
import { ChatbotError, type ErrorCode } from './errors';
import type { ChatMessage, ChatTools, CustomUIDataTypes } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatbotError(code as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatbotError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatbotError('offline:chat');
    }

    throw error;
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDocumentTimestampByIndex(
  documents: Document[],
  index: number,
) {
  if (!documents) { return new Date(); }
  if (index > documents.length) { return new Date(); }

  return documents[index].createdAt;
}

export function sanitizeText(text: string) {
  const sanitized = text.replace('<has_function_call>', '');
  const extractedFromResponseStream = extractTextFromResponseEventStream(sanitized);
  if (extractedFromResponseStream !== null) {
    return extractedFromResponseStream;
  }

  if (looksLikeResponsesEventStream(sanitized)) {
    return '';
  }

  return sanitized;
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => sanitizeText((part as { type: 'text'; text: string}).text))
    .join('');
}

/**
 * Safety net: handles raw event streams stored in DB before
 * extractTextFromResponsesPayload was introduced (write-path).
 * Removable once all legacy messages are migrated.
 */
function extractTextFromResponseEventStream(text: string): string | null {
  const extractedText = extractTextFromResponsesPayload(text);
  if (extractedText.length > 0) {
    return extractedText;
  }

  return extractTextFromResponseEventStreamFallback(text);
}

function looksLikeResponsesEventStream(text: string): boolean {
  return text.includes('"type":"response.') || text.includes('"type": "response.');
}

function extractTextFromResponseEventStreamFallback(text: string): string | null {
  const doneMatches = Array.from(
    text.matchAll(
      /"type"\s*:\s*"response\.output_text\.done"[\s\S]*?"text"\s*:\s*"((?:\\.|[^"\\])*)"/g
    )
  );
  const doneText = doneMatches.at(-1)?.[1];
  if (doneText) {
    return decodeJsonStringValue(doneText).trim();
  }

  const contentPartMatches = Array.from(
    text.matchAll(
      /"type"\s*:\s*"response\.content_part\.done"[\s\S]*?"part"\s*:\s*\{[\s\S]*?"text"\s*:\s*"((?:\\.|[^"\\])*)"/g
    )
  );
  const contentPartText = contentPartMatches.at(-1)?.[1];
  if (contentPartText) {
    return decodeJsonStringValue(contentPartText).trim();
  }

  const deltaMatches = Array.from(
    text.matchAll(
      /"type"\s*:\s*"response\.output_text\.delta"[\s\S]*?"delta"\s*:\s*"((?:\\.|[^"\\])*)"/g
    )
  );
  if (deltaMatches.length > 0) {
    return deltaMatches.map((match) => decodeJsonStringValue(match[1])).join('');
  }

  return null;
}

function decodeJsonStringValue(rawValue: string): string {
  try {
    return JSON.parse(`"${rawValue}"`) as string;
  } catch {
    return rawValue;
  }
}
