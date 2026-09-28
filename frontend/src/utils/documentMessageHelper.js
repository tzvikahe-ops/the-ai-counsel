/**
 * Translates document-upload error/warning messages returned by the backend.
 *
 * @param {string} msg - The message to translate
 * @param {Function} t - The translation function (from useTranslation)
 * @returns {string} The localized message
 */
export function getLocalDocumentMessage(msg, t) {
  if (!msg) return '';

  if (msg === 'Invalid filename.') return t('documentUpload.errors.invalidFilename');
  if (msg === 'Each document must be an object.') return t('documentUpload.errors.invalidDocumentObject');
  if (msg === 'OCR timed out.') return t('documentUpload.errors.ocrTimedOut');
  if (msg === 'Document text was truncated.') return t('documentUpload.errors.textTruncated');
  if (msg === 'OCR is unavailable or disabled; some scanned/image-only pages may be missing text.') {
    return t('documentUpload.errors.ocrUnavailable');
  }
  if (msg === 'Failed to extract documents' || msg === 'Failed to extract document text.') {
    return t('documentUpload.errors.extractionFailed');
  }

  let match;
  if ((match = msg.match(/^Too many documents\. Maximum is (\d+)\.$/))) {
    return t('documentUpload.errors.tooManyDocuments', { max: match[1] });
  }
  if ((match = msg.match(/^OCR skipped because (\d+) pages need OCR and the limit is (\d+)\.$/))) {
    return t('documentUpload.errors.ocrSkipped', { count: match[1], max: match[2] });
  }
  if ((match = msg.match(/^(.+) has too many pages\. Maximum is (\d+)\.$/))) {
    return t('documentUpload.errors.tooManyPages', { name: match[1], max: match[2] });
  }
  if ((match = msg.match(/^(.+) is too large\.$/))) {
    return t('documentUpload.errors.tooLarge', { name: match[1] });
  }
  if ((match = msg.match(/^(.+) is not valid base64\.$/))) {
    return t('documentUpload.errors.invalidBase64', { name: match[1] });
  }
  if ((match = msg.match(/^(.+) exceeds the per-document text limit\.$/))) {
    return t('documentUpload.errors.exceedsTextLimit', { name: match[1] });
  }
  if ((match = msg.match(/^(.+) is not a valid PDF\.$/))) {
    return t('documentUpload.errors.invalidPdf', { name: match[1] });
  }
  if ((match = msg.match(/^(.+) has an unsupported file type\.$/))) {
    return t('documentUpload.errors.unsupportedType', { name: match[1] });
  }
  if ((match = msg.match(/^OCR failed: ([\s\S]*)$/))) {
    return t('documentUpload.errors.ocrFailed', { message: match[1] });
  }
  if ((match = msg.match(/^(.+) is encrypted and cannot be opened\.$/))) {
    return t('documentUpload.errors.encrypted', { name: match[1] });
  }

  return msg;
}
