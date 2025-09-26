import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, GitBranch, Folder, Settings } from 'lucide-react';

interface ClaudeHooksGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CodeBlock = ({ children, language = 'bash' }: { children: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-slate-950 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          {language}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="text-sm text-slate-100 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const ClaudeHooksGuide: React.FC<ClaudeHooksGuideProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Claude Hooks Setup Guide
          </DialogTitle>
          <DialogDescription>
            Add powerful Claude hooks to enhance your development workflow
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Simple Setup Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Quick Setup
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Clone the hooks repository</h4>
                  <CodeBlock>
{`git clone https://github.com/MaximA21/lens-claude-mirror.git`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Copy the .claude folder</h4>
                  <p className="text-muted-foreground text-sm mb-2">
                    Navigate to the cloned repository and copy the <code className="bg-slate-100 px-1 rounded">.claude</code> folder to your project root:
                  </p>
                  <CodeBlock>
{`# Navigate to the cloned repo
cd lens-claude-mirror

# Copy the .claude folder to your project
cp -r .claude /path/to/your/project/

# Or if you're in your project directory
cp -r /path/to/lens-claude-mirror/.claude ./`}
                  </CodeBlock>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-800 flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    What's in the .claude folder?
                  </h4>
                  <p className="text-blue-700 text-sm mb-2">
                    The .claude folder contains configuration files and hooks that enhance Claude's integration with your project:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                    <li>Project-specific Claude settings</li>
                    <li>Custom hooks for development workflows</li>
                    <li>Integration configurations</li>
                    <li>Context and prompt templates</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium text-sm">✅ Setup Complete!</p>
                  <p className="text-green-700 text-xs mt-1">
                    Your project now has Claude hooks configured. The hooks will automatically enhance Claude's understanding of your project structure and workflow.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-2">📋 Next Steps</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                <li>Restart Claude Code to load the new hooks</li>
                <li>Check your project structure is recognized by Claude</li>
                <li>Explore enhanced Claude features in your development workflow</li>
                <li>Customize hooks as needed for your specific project requirements</li>
              </ul>
            </div>

            {/* Repository Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 font-medium text-sm">🔗 Source Repository</p>
              <p className="text-blue-700 text-xs mt-1">
                For more information and updates, visit: 
                <code className="bg-blue-100 px-1 rounded ml-1">https://github.com/MaximA21/lens-claude-mirror.git</code>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ClaudeHooksGuide;