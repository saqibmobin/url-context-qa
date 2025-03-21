
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RotateCw, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProcessingStatus } from "@/types";

interface UrlInputProps {
  onIngest: (urls: string[]) => void;
  onReset: () => void;
  processing: ProcessingStatus;
  error?: string;
  disabled?: boolean;
}

const UrlInput = ({ onIngest, onReset, processing, error, disabled = false }: UrlInputProps) => {
  const [urlInput, setUrlInput] = useState("");

  const handleIngest = () => {
    const urls = urlInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== "");
      
    if (urls.length > 0) {
      onIngest(urls);
    }
  };

  const handleReset = () => {
    setUrlInput("");
    onReset();
  };

  return (
    <div className="space-y-4 w-full animate-fade-in">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
            Enter URLs (one per line)
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="relative">
          <Textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com&#10;https://another-site.com"
            className={cn(
              "resize-none h-32 font-mono text-sm transition-all duration-200 focus-visible:ring-1 focus-visible:ring-ring",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={processing === ProcessingStatus.Processing || disabled}
          />
          
          {processing === ProcessingStatus.Processing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="glass-panel-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <RotateCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing URLs...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-1.5 transition-all duration-200 shadow-button"
          disabled={processing === ProcessingStatus.Processing || disabled}
        >
          <RotateCw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button
          onClick={handleIngest}
          className={cn(
            "gap-1.5 transition-all duration-200 shadow-button",
            processing === ProcessingStatus.Processing && "animate-pulse-subtle"
          )}
          disabled={!urlInput.trim() || processing === ProcessingStatus.Processing || disabled}
        >
          <Upload className="h-4 w-4" />
          Ingest URLs
        </Button>
      </div>
    </div>
  );
};

export default UrlInput;
