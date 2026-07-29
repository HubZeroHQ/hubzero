'use client';

import { ChevronDown, FileText, Loader2, Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { MediaPicker } from '@/components/media/MediaPicker';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { Block } from '@/lib/documents/blocks';
import type { DocumentOutlineHeading } from '@/lib/ai/types';
import type {
  GenerateDocumentInput,
  GenerateBlocksActionResult,
} from '@/lib/studio/generate-content-actions';
import { extractReferenceFileTextAction } from '@/lib/studio/actions/ai-extraction';
import { cn } from '@/lib/utils/cn';
import { selectClass, textareaClass } from '@/components/documents/editor/fields/shared';
import { useAiAction } from './use-ai-action';

interface SupportingFile {
  fileName: string;
  text: string;
}

/**
 * The whole-document "Generate content" panel — the premium generation
 * experience the Phase 10 brief describes: content type, purpose, audience,
 * technical depth, length, tone, writing style, existing context, additional
 * instructions, notes, supporting material, and optional reference images,
 * with everything past the first two fields collapsed behind "Advanced
 * options" by default (progressive disclosure — CMS_PRODUCT_DESIGN.md §30's
 * "AI assistance is opt-in, not the default path" extends to the panel's own
 * layout, not just whether it opens automatically).
 *
 * "Existing context" is not a field to fill in — it's a transparency panel:
 * the entry's title, summary, technologies, and relationships are always
 * assembled server-side (`lib/studio/ai-context.ts`) and never re-entered
 * here. What *is* shown is the document's current outline, since that's the
 * one piece of context the author can see and might want to react to.
 */
export function GenerateContentPanel({
  open,
  onOpenChange,
  contentTypeLabel,
  currentOutline,
  onGenerate,
  onInserted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTypeLabel: string;
  currentOutline: DocumentOutlineHeading[];
  onGenerate: (input: GenerateDocumentInput) => Promise<GenerateBlocksActionResult>;
  onInserted: (blocks: Block[], containsPlaceholders: boolean) => void;
}) {
  const [contentType, setContentType] = useState(contentTypeLabel);
  const [freeformText, setFreeformText] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [audience, setAudience] = useState('');
  const [technicalDepth, setTechnicalDepth] =
    useState<GenerateDocumentInput['technicalDepth']>(undefined);
  const [length, setLength] = useState<GenerateDocumentInput['length']>(undefined);
  const [tone, setTone] = useState<GenerateDocumentInput['tone']>(undefined);
  const [writingStyle, setWritingStyle] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [supportingFiles, setSupportingFiles] = useState<SupportingFile[]>([]);
  const [fileError, setFileError] = useState<string | undefined>();
  const [extracting, setExtracting] = useState(false);
  const [images, setImages] = useState<MediaAssetDTO[]>([]);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, error, run } = useAiAction<{ blocks: Block[]; containsPlaceholders: boolean }>();

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setFileError(undefined);
    setExtracting(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set('file', file);
        const result = await extractReferenceFileTextAction(formData);
        if (!result.ok) {
          setFileError(result.error);
          continue;
        }
        setSupportingFiles((prev) => [...prev, { fileName: result.fileName, text: result.text }]);
      }
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeFile(fileName: string) {
    setSupportingFiles((prev) => prev.filter((entry) => entry.fileName !== fileName));
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((asset) => asset.id !== id));
  }

  function resetForm() {
    setContentType(contentTypeLabel);
    setFreeformText('');
    setPurpose('');
    setAudience('');
    setTechnicalDepth(undefined);
    setLength(undefined);
    setTone(undefined);
    setWritingStyle('');
    setAdditionalInstructions('');
    setSupportingFiles([]);
    setImages([]);
    setAdvancedOpen(false);
  }

  async function handleGenerate() {
    const result = await run(() =>
      onGenerate({
        contentType: contentType.trim() || contentTypeLabel,
        freeformText: freeformText.trim() || undefined,
        extractedDocumentText:
          supportingFiles.length > 0 ? supportingFiles.map((file) => file.text) : undefined,
        images: images.map((asset) => ({
          mediaId: asset.id,
          url: asset.url,
          description: asset.caption ?? asset.altText,
        })),
        outline: currentOutline.length > 0 ? currentOutline : undefined,
        purpose: purpose.trim() || undefined,
        audience: audience.trim() || undefined,
        technicalDepth,
        length,
        tone,
        writingStyle: writingStyle.trim() || undefined,
        additionalInstructions: additionalInstructions.trim() || undefined,
      }),
    );
    if (result) {
      onInserted(result.blocks, result.containsPlaceholders);
      resetForm();
      onOpenChange(false);
    }
  }

  const isLoading = status === 'loading';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isLoading) onOpenChange(next);
      }}
      title="Generate content"
      description="Drafts land as new blocks you review before saving — nothing here publishes automatically."
      widthClassName="max-w-[640px]"
    >
      <div className="flex flex-col gap-5">
        <Field label="Content type" name="ai-content-type">
          <Input
            id="ai-content-type"
            value={contentType}
            onChange={(event) => setContentType(event.target.value)}
            placeholder="e.g. case study, technical documentation"
          />
        </Field>

        <Field
          label="Notes"
          name="ai-freeform-text"
          hint="Rough notes, an outline, or a project summary — write however is fastest."
        >
          <textarea
            id="ai-freeform-text"
            value={freeformText}
            onChange={(event) => setFreeformText(event.target.value)}
            rows={5}
            placeholder="What should this document cover?"
            className={textareaClass}
          />
        </Field>

        <div className="border-border-muted rounded-card border p-3">
          <p className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
            Existing context
          </p>
          <p className="text-text-secondary mt-1 text-xs">
            This entry&rsquo;s title, summary, technologies, and relationships are included
            automatically.
          </p>
          {currentOutline.length > 0 ? (
            <ul className="text-text-secondary mt-2 flex flex-col gap-0.5 text-xs">
              {currentOutline.map((heading, index) => (
                <li key={index} style={{ paddingLeft: (heading.level - 2) * 12 }}>
                  {heading.text || 'Untitled heading'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted mt-2 text-xs">The document is currently empty.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          aria-expanded={advancedOpen}
          className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1.5 self-start text-xs transition-colors"
        >
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform', advancedOpen && 'rotate-180')}
            aria-hidden
          />
          Advanced options
        </button>

        {advancedOpen ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Purpose" name="ai-purpose">
                <Input
                  id="ai-purpose"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="What should this achieve?"
                />
              </Field>
              <Field label="Audience" name="ai-audience">
                <Input
                  id="ai-audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder="Who is reading this?"
                />
              </Field>
              <Field label="Technical depth" name="ai-technical-depth">
                <select
                  id="ai-technical-depth"
                  value={technicalDepth ?? ''}
                  onChange={(event) =>
                    setTechnicalDepth((event.target.value || undefined) as typeof technicalDepth)
                  }
                  className={selectClass}
                >
                  <option value="">Default</option>
                  <option value="introductory">Introductory</option>
                  <option value="practitioner">Practitioner</option>
                  <option value="expert">Expert</option>
                </select>
              </Field>
              <Field label="Length" name="ai-length">
                <select
                  id="ai-length"
                  value={length ?? ''}
                  onChange={(event) =>
                    setLength((event.target.value || undefined) as typeof length)
                  }
                  className={selectClass}
                >
                  <option value="">Default</option>
                  <option value="brief">Brief</option>
                  <option value="standard">Standard</option>
                  <option value="in-depth">In-depth</option>
                </select>
              </Field>
              <Field label="Tone" name="ai-tone">
                <select
                  id="ai-tone"
                  value={tone ?? ''}
                  onChange={(event) => setTone((event.target.value || undefined) as typeof tone)}
                  className={selectClass}
                >
                  <option value="">Default</option>
                  <option value="neutral">Neutral</option>
                  <option value="narrative">Narrative</option>
                  <option value="direct">Direct</option>
                  <option value="analytical">Analytical</option>
                </select>
              </Field>
              <Field label="Writing style" name="ai-writing-style">
                <Input
                  id="ai-writing-style"
                  value={writingStyle}
                  onChange={(event) => setWritingStyle(event.target.value)}
                  placeholder="Optional style notes"
                />
              </Field>
            </div>

            <Field label="Additional instructions" name="ai-additional-instructions">
              <textarea
                id="ai-additional-instructions"
                value={additionalInstructions}
                onChange={(event) => setAdditionalInstructions(event.target.value)}
                rows={3}
                className={textareaClass}
              />
            </Field>

            <div className="flex flex-col gap-2">
              <p className="text-text-secondary text-sm">Supporting material</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={(event) => void handleFilesSelected(event.target.files)}
                className="text-text-muted text-xs"
              />
              {extracting ? (
                <p className="text-text-muted flex items-center gap-1.5 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Reading file…
                </p>
              ) : null}
              {fileError ? (
                <p role="alert" className="text-danger text-xs">
                  {fileError}
                </p>
              ) : null}
              {supportingFiles.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {supportingFiles.map((file) => (
                    <li
                      key={file.fileName}
                      className="border-border-default rounded-control flex items-center justify-between gap-2 border px-2.5 py-1.5 text-xs"
                    >
                      <span className="text-text-secondary inline-flex items-center gap-1.5 truncate">
                        <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {file.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.fileName)}
                        aria-label={`Remove ${file.fileName}`}
                        className="text-text-muted hover:text-text-primary shrink-0"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-text-muted text-xs">
                Used only for this request — never saved as Media or stored anywhere.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-text-secondary text-sm">Reference images</p>
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((asset) => (
                    <div
                      key={asset.id}
                      className="border-border-default rounded-control group relative aspect-square overflow-hidden border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.altText}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(asset.id)}
                        aria-label={`Remove ${asset.altText}`}
                        className="bg-surface-overlay text-text-primary absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setImagePickerOpen(true)}
                className="self-start"
              >
                Add reference image
              </Button>
              <p className="text-text-muted text-xs">
                The AI places images where they logically fit, or leaves a clearly marked
                placeholder.
              </p>
            </div>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleGenerate()} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Generate
              </>
            )}
          </Button>
        </div>
      </div>

      <MediaPicker
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelect={(asset) =>
          setImages((prev) =>
            prev.some((entry) => entry.id === asset.id) ? prev : [...prev, asset],
          )
        }
      />
    </Dialog>
  );
}
