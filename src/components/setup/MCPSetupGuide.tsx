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
import { Copy, Check, Terminal } from 'lucide-react';

interface MCPSetupGuideProps {
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

const MCPSetupGuide: React.FC<MCPSetupGuideProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Terminal className="h-5 w-5" />
            CloudWalkers MCP Server Setup Guide
          </DialogTitle>
          <DialogDescription>
            Complete guide to set up the CloudWalkers MCP server with Claude Code using FastMCP or manual configuration
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Simple Setup Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Quick Setup
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Clone the repository</h4>
                  <CodeBlock>
{`git clone https://github.com/VishiATChoudhary/CloudWalkers.git
cd CloudWalkers`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Run the server with FastMCP</h4>
                  <CodeBlock>
{`# Install FastMCP if you haven't already
pip install fastmcp

# Run the server
fastmcp run my_server.py`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Add to Claude Desktop</h4>
                  <p className="text-muted-foreground text-sm mb-2">For Claude Desktop, add this to your Claude config:</p>
                  <CodeBlock>
{`# Install to Claude Desktop
fastmcp install claude-desktop my_server.py

# Or manually add to Claude Desktop config file:
# On macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# On Windows: %APPDATA%/Claude/claude_desktop_config.json`}
                  </CodeBlock>
                  
                  <p className="text-muted-foreground text-sm mb-2">Manual config example:</p>
                  <CodeBlock language="json">
{`{
  "mcpServers": {
    "cloudwalkers": {
      "command": "fastmcp",
      "args": ["run", "/path/to/CloudWalkers/my_server.py"]
    }
  }
}`}
                  </CodeBlock>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium text-sm">✅ Done!</p>
                  <p className="text-green-700 text-xs mt-1">
                    Restart Claude Desktop and your MCP server will be available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MCPSetupGuide;