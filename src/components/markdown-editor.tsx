import { MarkdownEditorEnhancer } from "@/components/markdown-editor-enhancer";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  helperText?: string;
};

export function MarkdownEditor({ className, helperText, id, ...props }: MarkdownEditorProps) {
  const textareaId = id ?? String(props.name ?? "markdown-editor");

  return (
    <div className="space-y-2">
      <Textarea id={textareaId} className={cn("min-h-72 font-mono", className)} {...props} />
      <MarkdownEditorEnhancer targetId={textareaId} helperText={helperText} />
    </div>
  );
}
