/**
 * The Studio's editor-state layer (v3.1 Phase 1). Import from here rather
 * than from individual modules — the split between the registry, the form
 * hook, and the guard hooks is an implementation detail, and keeping one
 * entry point is what makes it safe to move things behind it later.
 */
export { EditorGuardContext, useEditorRegistry } from './context';
export { EditorRegistry } from './editor-registry';
export { serializeForm, serializeFormEntries } from './form-snapshot';
export type {
  EditorGuardSnapshot,
  EditorHandle,
  EditorSaveStatus,
  NavigationIntent,
} from './types';
export { useEditorGuardState } from './use-editor-guard-state';
export { useEditorRegistration } from './use-editor-registration';
export { useFormEditorState, type FormEditorState } from './use-form-editor-state';
export { useGuardedRouter, type GuardedRouter } from './use-guarded-router';
