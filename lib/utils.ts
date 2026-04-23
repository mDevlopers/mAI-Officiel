import type {
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { DBMessage, Document } from '@/lib/db/schema';
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
  if (extractedFromResponseStream) {
    return extractedFromResponseStream;
  }

  const extractedFromJsonPayload = extractTextFromJsonPayload(sanitized);
  return extractedFromJsonPayload ?? sanitized;
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

function extractTextFromResponseEventStream(text: string): string | null {
  if (!text.includes('"type":"response.')) {
    return null;
  }

  const parsedEvents = extractJsonObjectsFromConcatenatedStream(text)
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null);

  if (parsedEvents.length === 0) {
    return null;
  }

  const doneText = parsedEvents
    .filter((entry) => entry.type === 'response.output_text.done' && typeof entry.text === 'string')
    .at(-1)?.text;

  if (typeof doneText === 'string' && doneText.trim().length > 0) {
    return doneText;
  }

  const deltaText = parsedEvents
    .filter((entry) => entry.type === 'response.output_text.delta' && typeof entry.delta === 'string')
    .map((entry) => entry.delta as string)
    .join('');

  return deltaText.trim().length > 0 ? deltaText : null;
}

function extractJsonObjectsFromConcatenatedStream(raw: string): unknown[] {
  const events: unknown[] = [];
  let depth = 0;
  let startIndex = -1;
  let isInsideString = false;
  let isEscaped = false;

  for (let i = 0; i < raw.length; i++) {
    const currentCharacter = raw[i];

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (currentCharacter === '\\') {
        isEscaped = true;
        continue;
      }

      if (currentCharacter === '"') {
        isInsideString = false;
      }
      continue;
    }

    if (currentCharacter === '"') {
      isInsideString = true;
      continue;
    }

    if (currentCharacter === '{') {
      if (depth === 0) {
        startIndex = i;
      }
      depth += 1;
      continue;
    }

    if (currentCharacter === '}') {
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        const eventAsString = raw.slice(startIndex, i + 1);
        try {
          events.push(JSON.parse(eventAsString) as unknown);
        } catch {
          // ignore malformed chunk
        }
        startIndex = -1;
      }
    }
  }

  return events;
}

function extractTextFromJsonPayload(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return extractReadableTextFromUnknown(parsed);
  } catch {
    const possibleJsonPrefix = trimmed.match(/^(\{[\s\S]*?\}|\[[\s\S]*?\])\s*([\s\S]+)$/);
    if (!possibleJsonPrefix?.[2]) {
      return null;
    }

    const trailingText = possibleJsonPrefix[2].trim();
    return trailingText.length > 0 ? trailingText : null;
  }
}

function extractReadableTextFromUnknown(value: unknown): string | null {
  if (typeof value === 'string') {
    const clean = value.trim();
    return clean.length > 0 ? clean : null;
  }

  if (Array.isArray(value)) {
    const pieces = value
      .map((item) => extractReadableTextFromUnknown(item))
      .filter((item): item is string => Boolean(item));

    if (pieces.length === 0) {
      return null;
    }

    return pieces.join('\n').trim();
  }

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const candidateKeys = [
    'response',
    'answer',
    'message',
    'text',
    'content',
    'output',
    'result',
  ];

  for (const key of candidateKeys) {
    const candidate = extractReadableTextFromUnknown(record[key]);
    if (candidate) {
      return candidate;
    }
  }

  return null;
}
