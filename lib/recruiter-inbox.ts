import type { JobPipelineRecord } from './job-pipeline';

export type RecruiterProvider = 'email' | 'linkedin' | 'indeed' | 'monster';

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: { data?: string; attachmentId?: string };
  parts?: GmailMessagePart[];
}

export interface GmailMessageResource {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
}

export interface RecruiterConversation {
  id: string;
  threadId: string;
  provider: RecruiterProvider;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  subject: string;
  snippet: string;
  plainBody: string;
  receivedAt: string;
  unread: boolean;
  messageId?: string;
  references?: string;
  officialReplyUrl?: string;
  pipelineRecord?: JobPipelineRecord;
}

const PLATFORM_HOSTS: Record<Exclude<RecruiterProvider, 'email'>, string[]> = {
  linkedin: ['linkedin.com', 'lnkd.in'],
  indeed: ['indeed.com', 'indeed.ca'],
  monster: ['monster.com', 'monster.ca'],
};

const IGNORE_LINK = /unsubscribe|preferences|privacy|help|settings|email-settings/i;

export function headerValue(headers: GmailHeader[] | undefined, name: string): string {
  return headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function decodeBase64Url(value: string): string {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function bodyForMime(part: GmailMessagePart | undefined, mimeType: string): string {
  if (!part) return '';
  if (part.mimeType === mimeType && part.body?.data) return decodeBase64Url(part.body.data);
  for (const child of part.parts ?? []) {
    const body = bodyForMime(child, mimeType);
    if (body) return body;
  }
  return '';
}

function textFromHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]+>/g, ' ');
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function parseMailbox(value: string): { name: string; email: string } {
  const match = value.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (!match) {
    const email = value.trim().replace(/^"|"$/g, '');
    return { name: email.split('@')[0] ?? email, email };
  }
  const email = match[2].trim();
  const name = match[1].trim().replace(/^"|"$/g, '') || email.split('@')[0] || email;
  return { name, email };
}

export function detectProvider(from: string, subject: string, _body = ''): RecruiterProvider {
  // Use the sender and subject—not links in the body. A direct recruiter email
  // often contains a LinkedIn profile in the signature and must stay replyable.
  const sender = from.toLowerCase();
  const topic = subject.toLowerCase();
  if (/linkedin\.com|lnkd\.in/.test(sender) || /\blinkedin\b/.test(topic)) return 'linkedin';
  if (/indeed\.(com|ca)/.test(sender) || /\bindeed\b/.test(topic)) return 'indeed';
  if (/monster\.(com|ca)/.test(sender) || /\bmonster\b/.test(topic)) return 'monster';
  return 'email';
}

function linksFromHtml(html: string): string[] {
  if (!html || typeof DOMParser === 'undefined') return [];
  const document = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(document.querySelectorAll('a[href]'))
    .map((anchor) => anchor.getAttribute('href') ?? '')
    .filter(Boolean);
}

function linksFromText(text: string): string[] {
  return text.match(/https?:\/\/[^\s<>"')]+/g) ?? [];
}

export function officialReplyLink(provider: RecruiterProvider, html: string, plainText: string): string | undefined {
  if (provider === 'email') return undefined;
  const hosts = PLATFORM_HOSTS[provider];
  return [...linksFromHtml(html), ...linksFromText(plainText)].find((candidate) => {
    if (IGNORE_LINK.test(candidate)) return false;
    try {
      const host = new URL(candidate).hostname.toLowerCase();
      return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
    } catch {
      return false;
    }
  });
}

export function matchPipelineRecord(
  subject: string,
  body: string,
  records: JobPipelineRecord[],
): JobPipelineRecord | undefined {
  const haystack = `${subject} ${body}`.toLowerCase();
  return records.find((record) => {
    const company = record.companyName.toLowerCase();
    const title = record.title.toLowerCase();
    return haystack.includes(company) || (title.length >= 12 && haystack.includes(title));
  });
}

export function recruiterConversation(
  message: GmailMessageResource,
  pipeline: JobPipelineRecord[],
): RecruiterConversation {
  const headers = message.payload?.headers;
  const from = headerValue(headers, 'From');
  const replyToHeader = headerValue(headers, 'Reply-To');
  const sender = parseMailbox(from);
  const replyTo = parseMailbox(replyToHeader || from).email;
  const subject = headerValue(headers, 'Subject') || '(No subject)';
  const html = bodyForMime(message.payload, 'text/html');
  const plain = bodyForMime(message.payload, 'text/plain') || textFromHtml(html);
  const plainBody = cleanText(plain);
  const snippet = cleanText(message.snippet || plainBody).slice(0, 280);
  const provider = detectProvider(from, subject, `${plainBody} ${html}`);

  return {
    id: message.id,
    threadId: message.threadId,
    provider,
    senderName: sender.name,
    senderEmail: sender.email,
    replyTo,
    subject,
    snippet,
    plainBody,
    receivedAt: new Date(Number(message.internalDate ?? Date.now())).toISOString(),
    unread: message.labelIds?.includes('UNREAD') ?? false,
    messageId: headerValue(headers, 'Message-ID') || undefined,
    references: headerValue(headers, 'References') || undefined,
    officialReplyUrl: officialReplyLink(provider, html, plain),
    pipelineRecord: matchPipelineRecord(subject, plainBody, pipeline),
  };
}

export function canReplyByEmail(conversation: RecruiterConversation): boolean {
  if (conversation.provider !== 'email') return false;
  return Boolean(conversation.replyTo)
    && !/\b(no-?reply|do-?not-?reply|notifications?)\b/i.test(conversation.replyTo);
}

export function suggestedReply(conversation: RecruiterConversation): string {
  const firstName = conversation.senderName.split(/\s+/)[0] || 'there';
  const role = conversation.pipelineRecord?.title;
  const roleLine = role ? ` regarding the ${role} opportunity` : '';
  return `Hi ${firstName},\n\nThank you for reaching out${roleLine}. I’d be glad to connect and learn more about the role, the team, and the priorities for this position.\n\nPlease let me know a convenient time to speak.\n\nBest,\nAkshit`;
}

function encodeUtf8Base64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function gmailReplyPayload(conversation: RecruiterConversation, body: string) {
  const subject = /^re:/i.test(conversation.subject) ? conversation.subject : `Re: ${conversation.subject}`;
  const references = [conversation.references, conversation.messageId].filter(Boolean).join(' ');
  const headers = [
    `To: ${conversation.replyTo}`,
    `Subject: ${subject}`,
    ...(conversation.messageId ? [`In-Reply-To: ${conversation.messageId}`] : []),
    ...(references ? [`References: ${references}`] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ];
  return {
    threadId: conversation.threadId,
    raw: encodeUtf8Base64Url(`${headers.join('\r\n')}\r\n\r\n${body}`),
  };
}
