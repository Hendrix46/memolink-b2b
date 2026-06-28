import { http, ApiError } from '@/shared/api';
import type { PhotoAccessLevel } from '@/shared/config/status';

/**
 * Resumable / chunked photographer upload (changelog §11).
 *
 * Flow per file: init → upload part(s) → status (resume) → complete → abort.
 * The file is sliced into `partSize`-byte chunks; each part is PUT as a raw
 * octet-stream body. On resume only the parts missing from
 * `completedPartNumbers` are re-uploaded. Progress is reported as
 * `uploadedBytes / totalSize`.
 */

interface ResumableInitResponse {
  uploadSessionId: string;
  partSize: number;
  objectKey: string;
}

interface ResumablePartResponse {
  partNumber: number;
  etag: string;
  sizeBytes: number;
}

interface ResumableStatusResponse {
  uploadSessionId: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED' | 'FAILED';
  totalSize: number;
  uploadedBytes: number;
  completedPartNumbers: number[];
}

interface ResumableCompleteResponse {
  fileId: string;
  eventPhotoId: string;
  state: string;
}

export interface ResumableProgress {
  uploadedBytes: number;
  totalSize: number;
}

export interface ResumableUploadOptions {
  eventId: string;
  file: File;
  accessLevel: PhotoAccessLevel;
  /** Reuse an existing session id (+ its part size) to resume an upload. */
  sessionId?: string;
  partSize?: number;
  onSession?: (sessionId: string, partSize: number) => void;
  onProgress?: (p: ResumableProgress) => void;
  signal?: AbortSignal;
}

const base = (eventId: string) => `/api/event/${eventId}/photographer/photos/resumable`;

export async function initResumable(
  eventId: string,
  file: File,
  accessLevel: PhotoAccessLevel,
): Promise<ResumableInitResponse> {
  return http.post<ResumableInitResponse>(`${base(eventId)}/init`, {
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    totalSize: file.size,
    accessLevel,
  });
}

export function getResumableStatus(
  eventId: string,
  sessionId: string,
): Promise<ResumableStatusResponse> {
  return http.get<ResumableStatusResponse>(`${base(eventId)}/${sessionId}`);
}

export function abortResumable(eventId: string, sessionId: string): Promise<void> {
  return http.delete<void>(`${base(eventId)}/${sessionId}`);
}

function uploadPart(
  eventId: string,
  sessionId: string,
  partNumber: number,
  chunk: Blob,
  signal?: AbortSignal,
): Promise<ResumablePartResponse> {
  return http.put<ResumablePartResponse>(
    `${base(eventId)}/${sessionId}/part/${partNumber}`,
    undefined,
    { binary: chunk, signal },
  );
}

function completeResumable(
  eventId: string,
  sessionId: string,
): Promise<ResumableCompleteResponse> {
  return http.post<ResumableCompleteResponse>(`${base(eventId)}/${sessionId}/complete`);
}

/**
 * Run the full resumable upload for one file. Resolves with the completion
 * contract; surfaces quota/access errors (403/409) as thrown `ApiError`.
 */
export async function runResumableUpload(
  opts: ResumableUploadOptions,
): Promise<ResumableCompleteResponse> {
  const { eventId, file, accessLevel, onSession, onProgress, signal } = opts;

  // 1. Init (or resume an existing session whose part size we already know).
  let sessionId = opts.sessionId;
  let partSize = opts.partSize ?? 0;
  let completed = new Set<number>();
  let uploadedBytes = 0;

  if (sessionId && partSize > 0) {
    // Resume: trust the DB for which parts already landed.
    const status = await getResumableStatus(eventId, sessionId);
    completed = new Set(status.completedPartNumbers);
    uploadedBytes = status.uploadedBytes;
  } else {
    const init = await initResumable(eventId, file, accessLevel);
    sessionId = init.uploadSessionId;
    partSize = init.partSize;
  }

  onSession?.(sessionId, partSize);
  onProgress?.({ uploadedBytes, totalSize: file.size });

  // 2. Upload the parts missing from completedPartNumbers.
  const totalParts = Math.max(1, Math.ceil(file.size / partSize));
  for (let part = 1; part <= totalParts; part += 1) {
    if (signal?.aborted) throw new ApiError('Upload aborted', 0, 0);
    if (completed.has(part)) continue;
    const start = (part - 1) * partSize;
    const chunk = file.slice(start, Math.min(start + partSize, file.size));
    const res = await uploadPart(eventId, sessionId, part, chunk, signal);
    uploadedBytes += res.sizeBytes;
    completed.add(part);
    onProgress?.({ uploadedBytes: Math.min(uploadedBytes, file.size), totalSize: file.size });
  }

  // 3. Complete (assembles parts → photo pipeline, 201).
  const done = await completeResumable(eventId, sessionId);
  onProgress?.({ uploadedBytes: file.size, totalSize: file.size });
  return done;
}
