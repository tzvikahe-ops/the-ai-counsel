import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { getLocalDocumentMessage } from '../utils/documentMessageHelper';
import './DocumentUpload.css';

const ACCEPTED_DOCUMENT_TYPES = [
  '.pdf', '.txt', '.md', '.csv', '.json', '.yaml', '.yml', '.xml', '.html',
  '.log', '.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.mdx', '.toml',
  '.ini', '.cfg', '.sh', '.sql',
].join(',');

const EMPTY_PAYLOAD = { documents: [], attachments: [], warnings: [] };

function formatAttachment(meta, t) {
  const chars = typeof meta.char_count === 'number' ? meta.char_count.toLocaleString() : '0';
  const flags = [];
  if (meta.page_count) flags.push(`${meta.page_count}p`);
  if (meta.ocr_used) flags.push('OCR');
  if (meta.truncated) flags.push(t('documentUpload.trimmed'));
  const charsLabel = t('documentUpload.charsUnit', { count: chars });
  return `${charsLabel}${flags.length ? ` · ${flags.join(' · ')}` : ''}`;
}

export default function DocumentUpload({
  disabled = false,
  resetKey = 0,
  onChange,
  onBusyChange,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    setAttachments([]);
    setDocuments([]);
    setWarnings([]);
    onChange?.(EMPTY_PAYLOAD);
    if (inputRef.current) inputRef.current.value = '';
  }, [resetKey]);

  const updatePayload = (nextDocuments, nextAttachments, nextWarnings) => {
    setDocuments(nextDocuments);
    setAttachments(nextAttachments);
    setWarnings(nextWarnings);
    onChange?.({
      documents: nextDocuments,
      attachments: nextAttachments,
      warnings: nextWarnings,
    });
  };

  const setBusy = (value) => {
    setIsExtracting(value);
    onBusyChange?.(value);
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const result = await api.extractDocuments(files);
      const warnings = (result.warnings || []).map((warning) => getLocalDocumentMessage(warning, t));
      updatePayload(result.documents || [], result.attachments || [], warnings);
    } catch (error) {
      updatePayload([], [], [getLocalDocumentMessage(error.message, t) || t('documentUpload.errors.extractionFailed')]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    const nextDocuments = documents.filter((_, i) => i !== index);
    const nextAttachments = attachments.filter((_, i) => i !== index);
    updatePayload(nextDocuments, nextAttachments, warnings);
  };

  return (
    <div className="document-upload">
      <input
        ref={inputRef}
        type="file"
        className="document-upload__input"
        accept={ACCEPTED_DOCUMENT_TYPES}
        multiple
        onChange={handleFiles}
        disabled={disabled || isExtracting}
      />
      <button
        type="button"
        className={`document-upload__button ${attachments.length > 0 ? 'document-upload__button--active' : ''}`}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isExtracting}
        title={t('documentUpload.attachTitle')}
      >
        <span aria-hidden="true">📎</span>
        <span>{isExtracting ? t('documentUpload.extracting') : t('documentUpload.attach')}</span>
      </button>

      {(attachments.length > 0 || warnings.length > 0) && (
        <div className="document-upload__panel">
          {attachments.map((attachment, index) => (
            <span className="document-upload__chip" key={`${attachment.name}-${index}`}>
              <span className="document-upload__chip-name">{attachment.name}</span>
              <span className="document-upload__chip-meta">{formatAttachment(attachment, t)}</span>
              <button
                type="button"
                className="document-upload__remove"
                onClick={() => removeAttachment(index)}
                disabled={disabled || isExtracting}
                title={t('documentUpload.removeTitle', { name: attachment.name })}
              >
                ×
              </button>
            </span>
          ))}
          {warnings.map((warning, index) => (
            <span className="document-upload__warning" key={`${warning}-${index}`}>
              {warning}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
