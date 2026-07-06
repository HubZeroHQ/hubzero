"use client";

import { Plus, Trash2 } from "lucide-react";

import { BlockList } from "@/components/admin/blocks/block-list";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { MediaPickerList } from "@/components/admin/media/media-picker-list";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  Block,
  CalloutBlockData,
  CodeBlockData,
  GalleryBlockData,
  HeadingBlockData,
  HtmlBlockData,
  ImageBlockData,
  MarkdownBlockData,
  MetricsBlockData,
  ParagraphBlockData,
  QuoteBlockData,
  SpacerBlockData,
  TableBlockData,
  TimelineBlockData,
  TwoColumnBlockData,
  VideoBlockData,
} from "@/lib/cms/blocks/types";

export interface BlockDataEditorProps {
  block: Block;
  onChange: (data: Block["data"]) => void;
}

/**
 * One inline editor per block type — a switch, not a per-type component
 * registry, matching `CmsField`'s own precedent (`cms-field.tsx`'s header
 * comment: "a switch, not a per-type component registry"). Each block type
 * touches exactly this one `case`, `registry.ts`'s metadata entry, and
 * `schema.ts`'s Zod case — the three places a new block type is expected to
 * touch, nowhere else.
 */
export function BlockDataEditor({ block, onChange }: BlockDataEditorProps) {
  switch (block.type) {
    case "heading":
      return <HeadingEditor data={block.data} onChange={onChange} />;
    case "paragraph":
      return <ParagraphEditor data={block.data} onChange={onChange} />;
    case "markdown":
      return <MarkdownEditor data={block.data} onChange={onChange} />;
    case "quote":
      return <QuoteEditor data={block.data} onChange={onChange} />;
    case "callout":
      return <CalloutEditor data={block.data} onChange={onChange} />;
    case "image":
      return <ImageEditor data={block.data} onChange={onChange} />;
    case "gallery":
      return <GalleryEditor data={block.data} onChange={onChange} />;
    case "video":
      return <VideoEditor data={block.data} onChange={onChange} />;
    case "metrics":
      return <MetricsEditor data={block.data} onChange={onChange} />;
    case "timeline":
      return <TimelineEditor data={block.data} onChange={onChange} />;
    case "divider":
      return (
        <p className="text-caption text-text-muted italic">A plain horizontal rule — no options.</p>
      );
    case "spacer":
      return <SpacerEditor data={block.data} onChange={onChange} />;
    case "twoColumn":
      return <TwoColumnEditor data={block.data} onChange={onChange} />;
    case "code":
      return <CodeEditor data={block.data} onChange={onChange} />;
    case "html":
      return <HtmlEditor data={block.data} onChange={onChange} />;
    case "table":
      return <TableEditor data={block.data} onChange={onChange} />;
    default: {
      // Exhaustiveness guard: a 16th `BlockType` that forgets a case here
      // fails the build instead of silently rendering no editor for it.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

function HeadingEditor({
  data,
  onChange,
}: {
  data: HeadingBlockData;
  onChange: (data: HeadingBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Level"
        value={String(data.level)}
        onValueChange={(value) => onChange({ ...data, level: value === "3" ? 3 : 2 })}
        options={[
          { value: "2", label: "Section heading" },
          { value: "3", label: "Subheading" },
        ]}
      />
      <Input
        label="Text"
        value={data.text}
        onChange={(event) => onChange({ ...data, text: event.target.value })}
      />
    </div>
  );
}

function ParagraphEditor({
  data,
  onChange,
}: {
  data: ParagraphBlockData;
  onChange: (data: ParagraphBlockData) => void;
}) {
  return (
    <Textarea
      label="Text"
      hint="Inline markdown — **bold**, *italic*, [links](url)."
      rows={4}
      value={data.text}
      onChange={(event) => onChange({ text: event.target.value })}
    />
  );
}

function MarkdownEditor({
  data,
  onChange,
}: {
  data: MarkdownBlockData;
  onChange: (data: MarkdownBlockData) => void;
}) {
  return (
    <Textarea
      label="Markdown"
      rows={10}
      value={data.markdown}
      onChange={(event) => onChange({ markdown: event.target.value })}
      className="font-mono"
    />
  );
}

function QuoteEditor({
  data,
  onChange,
}: {
  data: QuoteBlockData;
  onChange: (data: QuoteBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Textarea
        label="Quote"
        rows={3}
        value={data.text}
        onChange={(event) => onChange({ ...data, text: event.target.value })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Attribution"
          placeholder="e.g. a client's name"
          value={data.attribution ?? ""}
          onChange={(event) => onChange({ ...data, attribution: event.target.value })}
        />
        <Input
          label="Role / company"
          value={data.role ?? ""}
          onChange={(event) => onChange({ ...data, role: event.target.value })}
        />
      </div>
    </div>
  );
}

function CalloutEditor({
  data,
  onChange,
}: {
  data: CalloutBlockData;
  onChange: (data: CalloutBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Tone"
        value={data.tone}
        onValueChange={(value) => onChange({ ...data, tone: value as CalloutBlockData["tone"] })}
        options={[
          { value: "note", label: "Note" },
          { value: "info", label: "Info" },
          { value: "success", label: "Success" },
          { value: "warning", label: "Warning" },
        ]}
      />
      <Input
        label="Title (optional)"
        placeholder="e.g. Heads up"
        value={data.title ?? ""}
        onChange={(event) => onChange({ ...data, title: event.target.value })}
      />
      <Textarea
        label="Text"
        rows={3}
        value={data.text}
        onChange={(event) => onChange({ ...data, text: event.target.value })}
      />
    </div>
  );
}

function ImageEditor({
  data,
  onChange,
}: {
  data: ImageBlockData;
  onChange: (data: ImageBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <MediaPicker
        name={`__block-image-${data.media || "new"}`}
        label="Image"
        value={data.media || undefined}
        onChange={(value) => onChange({ ...data, media: value ?? "" })}
      />
      <Input
        label="Caption"
        value={data.caption ?? ""}
        onChange={(event) => onChange({ ...data, caption: event.target.value })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Alignment"
          value={data.align}
          onValueChange={(value) => onChange({ ...data, align: value as ImageBlockData["align"] })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />
        <Select
          label="Width"
          value={data.width}
          onValueChange={(value) => onChange({ ...data, width: value as ImageBlockData["width"] })}
          options={[
            { value: "content", label: "Content width" },
            { value: "wide", label: "Wide" },
            { value: "full", label: "Full bleed" },
          ]}
        />
      </div>
    </div>
  );
}

function GalleryEditor({
  data,
  onChange,
}: {
  data: GalleryBlockData;
  onChange: (data: GalleryBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <MediaPickerList
        name={`__block-gallery-${data.media.join(",") || "new"}`}
        label="Images"
        value={data.media}
        onChange={(value) => onChange({ ...data, media: value })}
      />
      <Select
        label="Layout"
        value={data.layout ?? "grid"}
        onValueChange={(value) =>
          onChange({ ...data, layout: value as GalleryBlockData["layout"] })
        }
        options={[
          { value: "grid", label: "Even grid" },
          { value: "masonry", label: "Masonry (natural aspect ratio)" },
        ]}
      />
      <Input
        label="Caption"
        value={data.caption ?? ""}
        onChange={(event) => onChange({ ...data, caption: event.target.value })}
      />
    </div>
  );
}

function VideoEditor({
  data,
  onChange,
}: {
  data: VideoBlockData;
  onChange: (data: VideoBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Video URL"
        hint="A YouTube, Vimeo, or direct video file URL."
        value={data.url}
        onChange={(event) => onChange({ ...data, url: event.target.value })}
      />
      <Input
        label="Caption"
        value={data.caption ?? ""}
        onChange={(event) => onChange({ ...data, caption: event.target.value })}
      />
    </div>
  );
}

function SpacerEditor({
  data,
  onChange,
}: {
  data: SpacerBlockData;
  onChange: (data: SpacerBlockData) => void;
}) {
  return (
    <Select
      label="Size"
      value={data.size}
      onValueChange={(value) => onChange({ size: value as SpacerBlockData["size"] })}
      options={[
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ]}
    />
  );
}

/** The languages `lib/cms/blocks/syntax-highlight.ts` bundles a Shiki grammar for — kept in sync with that module's own list so a language chosen here always highlights. */
const CODE_LANGUAGE_OPTIONS = [
  { value: "plaintext", label: "Plain text" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX" },
  { value: "javascript", label: "JavaScript" },
  { value: "jsx", label: "JSX" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
];

function CodeEditor({
  data,
  onChange,
}: {
  data: CodeBlockData;
  onChange: (data: CodeBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Language"
          value={data.language ?? "plaintext"}
          onValueChange={(value) => onChange({ ...data, language: value })}
          options={CODE_LANGUAGE_OPTIONS}
        />
        <Input
          label="Filename (optional)"
          value={data.filename ?? ""}
          onChange={(event) => onChange({ ...data, filename: event.target.value })}
        />
      </div>
      <Textarea
        label="Code"
        rows={10}
        value={data.code}
        onChange={(event) => onChange({ ...data, code: event.target.value })}
        className="font-mono"
      />
    </div>
  );
}

function HtmlEditor({
  data,
  onChange,
}: {
  data: HtmlBlockData;
  onChange: (data: HtmlBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Alert variant="warning">
        Admin/Head Admin only — publishing this document is blocked while this block is present,
        unless the person publishing is an Admin or Head Admin.
      </Alert>
      <Textarea
        label="Raw HTML"
        rows={8}
        value={data.html}
        onChange={(event) => onChange({ html: event.target.value })}
        className="font-mono"
      />
    </div>
  );
}

function MetricsEditor({
  data,
  onChange,
}: {
  data: MetricsBlockData;
  onChange: (data: MetricsBlockData) => void;
}) {
  function updateItem(index: number, patch: Partial<MetricsBlockData["items"][number]>) {
    const items = [...data.items];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, ...patch };
    onChange({ items });
  }

  return (
    <div className="flex flex-col gap-3">
      {data.items.map((item, index) => (
        <div key={index} className="flex items-end gap-2">
          <Input
            label={index === 0 ? "Label" : undefined}
            placeholder="e.g. Routes generated"
            value={item.label}
            onChange={(event) => updateItem(index, { label: event.target.value })}
          />
          <Input
            label={index === 0 ? "Value" : undefined}
            placeholder="e.g. 64"
            value={item.value}
            onChange={(event) => updateItem(index, { value: event.target.value })}
          />
          <Select
            label={index === 0 ? "Trend" : undefined}
            value={item.trend ?? "none"}
            onValueChange={(value) =>
              updateItem(index, {
                trend: value === "none" ? undefined : (value as "up" | "down" | "flat"),
              })
            }
            options={[
              { value: "none", label: "None" },
              { value: "up", label: "Up" },
              { value: "down", label: "Down" },
              { value: "flat", label: "Flat" },
            ]}
            className="w-28"
          />
          <IconButton
            aria-label="Remove metric"
            icon={<Trash2 className="size-4" />}
            size="md"
            onClick={() => onChange({ items: data.items.filter((_, i) => i !== index) })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => onChange({ items: [...data.items, { label: "", value: "" }] })}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add metric
      </Button>
    </div>
  );
}

function TimelineEditor({
  data,
  onChange,
}: {
  data: TimelineBlockData;
  onChange: (data: TimelineBlockData) => void;
}) {
  function updateItem(index: number, patch: Partial<TimelineBlockData["items"][number]>) {
    const items = [...data.items];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, ...patch };
    onChange({ items });
  }

  return (
    <div className="flex flex-col gap-4">
      {data.items.map((item, index) => (
        <div key={index} className="border-border-muted flex flex-col gap-2 border-l-2 pl-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[8rem_1fr]">
            <Input
              placeholder="Date, e.g. Nov 2024"
              value={item.date}
              onChange={(event) => updateItem(index, { date: event.target.value })}
            />
            <Input
              placeholder="Title"
              value={item.title}
              onChange={(event) => updateItem(index, { title: event.target.value })}
            />
          </div>
          <Textarea
            placeholder="Description (optional)"
            rows={2}
            value={item.description ?? ""}
            onChange={(event) => updateItem(index, { description: event.target.value })}
          />
          <IconButton
            aria-label="Remove entry"
            icon={<Trash2 className="size-4" />}
            size="sm"
            className="self-start"
            onClick={() => onChange({ items: data.items.filter((_, i) => i !== index) })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => onChange({ items: [...data.items, { date: "", title: "" }] })}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add entry
      </Button>
    </div>
  );
}

function TwoColumnEditor({
  data,
  onChange,
}: {
  data: TwoColumnBlockData;
  onChange: (data: TwoColumnBlockData) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Column widths"
        value={data.ratio ?? "50-50"}
        onValueChange={(value) =>
          onChange({ ...data, ratio: value as TwoColumnBlockData["ratio"] })
        }
        options={[
          { value: "50-50", label: "Even (50 / 50)" },
          { value: "60-40", label: "Left wider (60 / 40)" },
          { value: "40-60", label: "Right wider (40 / 60)" },
          { value: "70-30", label: "Left much wider (70 / 30)" },
          { value: "30-70", label: "Right much wider (30 / 70)" },
        ]}
        className="max-w-xs"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-caption text-text-muted mb-2 font-mono tracking-wide uppercase">
            Left column
          </p>
          <BlockList
            blocks={data.left as Block[]}
            onChange={(blocks) => onChange({ ...data, left: blocks as TwoColumnBlockData["left"] })}
            restrictToSimple
            emptyLabel="Empty column."
          />
        </div>
        <div>
          <p className="text-caption text-text-muted mb-2 font-mono tracking-wide uppercase">
            Right column
          </p>
          <BlockList
            blocks={data.right as Block[]}
            onChange={(blocks) =>
              onChange({ ...data, right: blocks as TwoColumnBlockData["right"] })
            }
            restrictToSimple
            emptyLabel="Empty column."
          />
        </div>
      </div>
    </div>
  );
}

function TableEditor({
  data,
  onChange,
}: {
  data: TableBlockData;
  onChange: (data: TableBlockData) => void;
}) {
  function updateHeader(index: number, value: string) {
    const headers = [...data.headers];
    headers[index] = value;
    onChange({ ...data, headers });
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const rows = data.rows.map((row) => [...row]);
    const row = rows[rowIndex];
    if (!row) return;
    row[colIndex] = value;
    onChange({ ...data, rows });
  }

  function addColumn() {
    onChange({
      ...data,
      headers: [...data.headers, ""],
      rows: data.rows.map((row) => [...row, ""]),
    });
  }

  function removeColumn(index: number) {
    onChange({
      ...data,
      headers: data.headers.filter((_, i) => i !== index),
      rows: data.rows.map((row) => row.filter((_, i) => i !== index)),
    });
  }

  function addRow() {
    onChange({ ...data, rows: [...data.rows, data.headers.map(() => "")] });
  }

  function removeRow(index: number) {
    onChange({ ...data, rows: data.rows.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {data.headers.map((header, index) => (
                <th key={index} className="p-1">
                  <div className="flex items-center gap-1">
                    <Input
                      value={header}
                      placeholder={`Column ${index + 1}`}
                      onChange={(event) => updateHeader(index, event.target.value)}
                    />
                    <IconButton
                      aria-label="Remove column"
                      icon={<Trash2 className="size-4" />}
                      size="sm"
                      onClick={() => removeColumn(index)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {data.headers.map((_, colIndex) => (
                  <td key={colIndex} className="p-1">
                    <Input
                      value={row[colIndex] ?? ""}
                      onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                    />
                  </td>
                ))}
                <td className="p-1">
                  <IconButton
                    aria-label="Remove row"
                    icon={<Trash2 className="size-4" />}
                    size="sm"
                    onClick={() => removeRow(rowIndex)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={addColumn}>
          <Plus className="size-4" aria-hidden="true" />
          Add column
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          <Plus className="size-4" aria-hidden="true" />
          Add row
        </Button>
      </div>
      <Input
        label="Caption (optional)"
        value={data.caption ?? ""}
        onChange={(event) => onChange({ ...data, caption: event.target.value })}
      />
    </div>
  );
}
