
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import UrlInput from "@/components/UrlInput";
import ChatInterface from "@/components/ChatInterface";
import { processUrls } from "@/utils/urlProcessor";
import { ContextData, ProcessingStatus, WebsiteMetadata } from "@/types";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("urls");
  const [contextData, setContextData] = useState<ContextData>({
    urls: [],
    content: "",
    isProcessing: false,
    metadata: []
  });
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle);

  const handleIngestUrls = async (urls: string[]) => {
    setStatus(ProcessingStatus.Processing);
    setContextData(prev => ({ ...prev, urls, isProcessing: true, error: undefined }));
    
    try {
      const result = await processUrls(urls);
      
      if (result.success && result.content) {
        setContextData({
          urls,
          content: result.content,
          isProcessing: false,
          metadata: result.metadata || []
        });
        setStatus(ProcessingStatus.Success);
        toast.success("URLs processed successfully", {
          description: `Processed ${urls.length} URL${urls.length > 1 ? 's' : ''}`
        });
        // Auto-switch to chat tab after successful ingestion
        setActiveTab("chat");
      } else {
        setContextData(prev => ({ 
          ...prev, 
          isProcessing: false,
          error: result.error 
        }));
        setStatus(ProcessingStatus.Error);
        toast.error("Failed to process URLs", {
          description: result.error
        });
      }
    } catch (error) {
      console.error("Error ingesting URLs:", error);
      setContextData(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: "An unexpected error occurred"
      }));
      setStatus(ProcessingStatus.Error);
      toast.error("Failed to process URLs", {
        description: "An unexpected error occurred"
      });
    }
  };

  const handleReset = () => {
    setContextData({
      urls: [],
      content: "",
      isProcessing: false,
      error: undefined,
      metadata: []
    });
    setStatus(ProcessingStatus.Idle);
    toast.info("Reset complete", {
      description: "All context and history has been cleared"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-radial from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <header className="w-full py-6 px-4 sm:px-6 border-b bg-white/80 backdrop-blur-md dark:bg-black/30 dark:border-gray-800 shadow-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-medium tracking-tight">URL Context Q&A</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Research Tool
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto glass-panel rounded-xl shadow-glass overflow-hidden border min-h-[600px]">
          <Tabs 
            defaultValue="urls" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="px-6 py-4 border-b">
              <TabsList className="grid grid-cols-2 h-11">
                <TabsTrigger value="urls" className="text-sm flex gap-2 data-[state=active]:shadow-none">
                  <FileText className="h-4 w-4" />
                  <span>URLs & Context</span>
                  {status === ProcessingStatus.Processing && (
                    <Loader2 className="h-3 w-3 animate-spin ml-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="text-sm flex gap-2 data-[state=active]:shadow-none"
                  disabled={contextData.content === "" && status !== ProcessingStatus.Success}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Q&A</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="urls" className="h-full p-6 m-0 data-[state=active]:animate-slide-up">
                <UrlInput
                  onIngest={handleIngestUrls}
                  onReset={handleReset}
                  processing={status}
                  error={contextData.error}
                />
                
                {contextData.urls.length > 0 && status === ProcessingStatus.Success && (
                  <div className="mt-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">
                        Processed URLs ({contextData.urls.length})
                      </h3>
                    </div>
                    <div className="glass-panel-sm rounded-lg p-4 space-y-3">
                      {contextData.urls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="truncate font-mono text-xs">
                            {url}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Extracted Content Preview</h3>
                    </div>
                    <div className="glass-panel-sm rounded-lg p-4 max-h-[300px] overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                        {contextData.content}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="chat" className="h-full m-0 overflow-hidden data-[state=active]:animate-slide-up">
                <div className="h-full">
                  <ChatInterface 
                    context={contextData.content} 
                    processingStatus={status}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      
      <footer className="w-full py-4 px-4 sm:px-6 text-center text-xs text-muted-foreground">
        <p>URL Context Q&A • Knowledge limited to ingested URLs</p>
      </footer>
    </div>
  );
};

export default Index;
