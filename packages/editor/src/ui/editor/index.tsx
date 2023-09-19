"use client"
import * as React from 'react';
import { useImperativeHandle, useRef, forwardRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { useDebouncedCallback } from "use-debounce";
import { TableMenu } from '@/ui/editor/menus/table-menu';
import { TiptapExtensions } from '@/ui/editor/extensions';
import { EditorBubbleMenu } from '@/ui/editor/menus/bubble-menu';
import { ImageResizer } from '@/ui/editor/extensions/image/image-resize';
import { TiptapEditorProps } from '@/ui/editor/props';
import { UploadImage } from '@/types/upload-image';
import { DeleteImage } from '@/types/delete-image';

export interface ITipTapRichTextEditor {
  value: string;
  uploadFile: UploadImage;
  deleteFile: DeleteImage;
  noBorder?: boolean;
  borderOnFocus?: boolean;
  customClassName?: string;
  editorContentCustomClassNames?: string;
  onChange?: (json: any, html: string) => void;
  setIsSubmitting?: (isSubmitting: "submitting" | "submitted" | "saved") => void;
  setShouldShowAlert?: (showAlert: boolean) => void;
  workspaceSlug: string;
  editable?: boolean;
  forwardedRef?: any;
  debouncedUpdatesEnabled?: boolean;
}

const Tiptap = (props: ITipTapRichTextEditor) => {
  const {
    onChange,
    debouncedUpdatesEnabled,
    forwardedRef,
    editable,
    setIsSubmitting,
    setShouldShowAlert,
    editorContentCustomClassNames,
    value,
    uploadFile,
    deleteFile,
    noBorder,
    workspaceSlug,
    borderOnFocus,
    customClassName,
  } = props;

  const editor = useEditor({
    editable: editable ?? true,
    editorProps: TiptapEditorProps(workspaceSlug, uploadFile, setIsSubmitting),
    // @ts-ignore
    extensions: TiptapExtensions(workspaceSlug, uploadFile, deleteFile, setIsSubmitting),
    content: (typeof value === "string" && value.trim() !== "") ? value : "<p></p>",
    onUpdate: async ({ editor }) => {
      // for instant feedback loop
      setIsSubmitting?.("submitting");
      setShouldShowAlert?.(true);
      if (debouncedUpdatesEnabled) {
        debouncedUpdates({ onChange, editor });
      } else {
        onChange?.(editor.getJSON(), editor.getHTML());
      }
    },
  });

  const editorRef: React.MutableRefObject<Editor | null> = useRef(null);

  useImperativeHandle(forwardedRef, () => ({
    clearEditor: () => {
      editorRef.current?.commands.clearContent();
    },
    setEditorValue: (content: string) => {
      editorRef.current?.commands.setContent(content);
    },
  }));

  const debouncedUpdates = useDebouncedCallback(async ({ onChange, editor }) => {
    setTimeout(async () => {
      if (onChange) {
        onChange(editor.getJSON(), editor.getHTML());
      }
    }, 500);
  }, 1000);

  const editorClassNames = `relative w-full max-w-full sm:rounded-lg mt-2 p-3 relative focus:outline-none rounded-md
      ${noBorder ? "" : "border border-custom-border-200"} ${borderOnFocus ? "focus:border border-custom-border-300" : "focus:border-0"
    } ${customClassName}`;

  if (!editor) return null;
  editorRef.current = editor;

  return (
    <div
      id="tiptap-container"
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className={`tiptap-editor-container cursor-text ${editorClassNames}`}
    >
      {editor && <EditorBubbleMenu editor={editor} />}
      <div className={`${editorContentCustomClassNames}`}>
        <EditorContent editor={editor} />
        <TableMenu editor={editor} />
        {editor?.isActive("image") && <ImageResizer editor={editor} />}
      </div>
    </div>
  );
};

const TipTapEditor = forwardRef<ITipTapRichTextEditor, ITipTapRichTextEditor>((props, ref) => (
  <Tiptap {...props} forwardedRef={ref} />
));

TipTapEditor.displayName = "TipTapEditor";

export { TipTapEditor };