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
import { Copy, Check, Terminal, Download, Settings, Database, Zap, AlertTriangle } from 'lucide-react';

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
            MCP Server Setup Guide for Claude Code
          </DialogTitle>
          <DialogDescription>
            Complete guide to set up MCP servers with Claude Code using FastMCP or manual configuration
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* FastMCP Easy Setup */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800">
                <Zap className="h-4 w-4" />
                ⚡ Quick Setup with FastMCP (Recommended)
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                The CloudWalkers MCP server is ready to use! Just clone, configure, and install with FastMCP.
              </p>
              
              <h4 className="font-medium mb-2 text-blue-800">1. Clone the CloudWalkers Repository</h4>
              <CodeBlock>
{`git clone https://github.com/VishiATChoudhary/CloudWalkers.git
cd CloudWalkers`}
              </CodeBlock>

              <h4 className="font-medium mb-2 text-blue-800">2. Install FastMCP</h4>
              <CodeBlock>pip install fastmcp</CodeBlock>

              <h4 className="font-medium mb-2 text-blue-800">3. Configure Environment Variables</h4>
              <p className="text-blue-700 text-sm mb-2">Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the CloudWalkers directory:</p>
              <CodeBlock language="bash">
{`# Add your Supabase credentials
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-service-role-key-or-anon-key"
USER_ID="your-unique-user-identifier"
PROJECT_ID="your-project-identifier"`}
              </CodeBlock>

              <h4 className="font-medium mb-2 text-blue-800">4. Install to Claude Code</h4>
              <CodeBlock>
{`# Install with environment file
fastmcp install claude-code my_server.py --env-file .env

# Or with individual environment variables
fastmcp install claude-code my_server.py \\
  --env SUPABASE_URL="https://your-project-id.supabase.co" \\
  --env SUPABASE_KEY="your-key" \\
  --env USER_ID="your-user-id" \\
  --env PROJECT_ID="your-project-id"`}
              </CodeBlock>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <p className="text-green-800 font-medium text-sm">✅ That's it! Your CloudWalkers MCP server is now configured with Claude Code.</p>
                <p className="text-green-700 text-xs mt-1">FastMCP automatically handles dependency management and integrates with Claude Code's MCP system.</p>
              </div>
            </div>

            {/* Alternative Manual Setup Header */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Alternative: Manual Configuration
              </h3>
              <p className="text-muted-foreground text-sm">
                For more control or if you prefer manual setup, follow the detailed configuration below.
              </p>
            </div>

            {/* Prerequisites */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Prerequisites
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Python 3.8 or higher</li>
                <li>Active Supabase project</li>
                <li>Claude Code installed</li>
                <li>Git</li>
              </ul>
            </div>

            {/* Installation */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Installation
              </h3>
              
              <h4 className="font-medium mb-2">1. Clone the Repository</h4>
              <CodeBlock>
{`git clone https://github.com/VishiATChoudhary/CloudWalkers.git
cd CloudWalkers`}
              </CodeBlock>

              <h4 className="font-medium mb-2">2. Install Python Dependencies</h4>
              <CodeBlock>pip install -r requirements.txt</CodeBlock>
            </div>

            {/* Supabase Setup */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Set Up Supabase
              </h3>
              
              <h4 className="font-medium mb-2">Create Database Table</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground mb-4">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Run the SQL commands from <code className="bg-slate-100 px-1 rounded">create_table.sql</code></li>
              </ol>

              <h4 className="font-medium mb-2">Get Supabase Credentials</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground mb-4">
                <li>In your Supabase project dashboard, go to Settings → API</li>
                <li>Copy your <strong>Project URL</strong> and <strong>Service Role Key</strong> (or anon key)</li>
              </ol>
            </div>

            {/* Environment Variables */}
            <div>
              <h4 className="font-medium mb-2">4. Configure Environment Variables</h4>
              <p className="text-muted-foreground mb-2">Create a <code className="bg-slate-100 px-1 rounded">.env</code> file in the project root:</p>
              <CodeBlock language="bash">
{`# Copy and fill in your actual values
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-service-role-key-or-anon-key"
USER_ID="your-unique-user-identifier"
PROJECT_ID="your-project-identifier"`}
              </CodeBlock>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-3">
                <h5 className="font-medium text-yellow-800 mb-2">Important Security Notes:</h5>
                <ul className="list-disc list-inside space-y-1 text-yellow-700 text-xs">
                  <li>Use <strong>Service Role Key</strong> to bypass Row Level Security (RLS)</li>
                  <li>Use <strong>Anon Key</strong> if you have RLS policies configured</li>
                  <li>Never commit your <code>.env</code> file to version control</li>
                </ul>
              </div>
            </div>

            {/* Claude Code Configuration */}
            <div>
              <h4 className="font-medium mb-2">5. Configure Claude Code MCP</h4>
              
              <div className="space-y-4">
                {/* FastMCP Method */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-800 mb-2">Option A: Using FastMCP (Recommended)</h5>
                  <CodeBlock>
{`# Install your server with FastMCP
fastmcp install claude-code my_server.py --env-file .env

# Or with individual environment variables
fastmcp install claude-code my_server.py \\
  --env SUPABASE_URL="https://your-project-id.supabase.co" \\
  --env SUPABASE_KEY="your-key" \\
  --env USER_ID="your-user-id" \\
  --env PROJECT_ID="your-project-id"`}
                  </CodeBlock>
                </div>

                {/* Manual Method */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2">Option B: Manual Configuration</h5>
                  
                  <p className="text-muted-foreground mb-2 text-sm">1. Use Claude Code's built-in MCP commands:</p>
                  <CodeBlock>
{`# Add server with environment variables
claude mcp add goonersquad-server \\
  -e SUPABASE_URL="https://your-project-id.supabase.co" \\
  -e SUPABASE_KEY="your-key" \\
  -e USER_ID="your-user-id" \\
  -e PROJECT_ID="your-project-id" \\
  -- uv run --with fastmcp fastmcp run my_server.py`}
                  </CodeBlock>

                  <p className="text-muted-foreground mb-2 text-sm">2. Or manually edit your Claude Code settings file:</p>
                  <CodeBlock>
{`# Check location: claude config list
# ~/.claude/settings.json`}
                  </CodeBlock>

                  <CodeBlock language="json">
{`{
  "mcp": {
    "servers": {
      "goonersquad-server": {
        "command": "uv",
        "args": ["run", "--with", "fastmcp", "fastmcp", "run", "/path/to/my_server.py"],
        "env": {
          "SUPABASE_URL": "https://your-project-id.supabase.co",
          "SUPABASE_KEY": "your-key",
          "USER_ID": "your-user-id",
          "PROJECT_ID": "your-project-id"
        }
      }
    }
  }
}`}
                  </CodeBlock>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-medium text-sm">Requirements</p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Claude Code must be installed and available at the default location (~/.claude/local/claude) for FastMCP integration to work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-2 text-sm mt-4">3. Restart Claude Code to load the MCP server</p>
            </div>

            {/* Testing */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Testing the Setup</h3>
              
              <h4 className="font-medium mb-2">1. Test MCP Server Directly</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-sm">With FastMCP:</p>
                  <CodeBlock>fastmcp run server.py</CodeBlock>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Traditional method:</p>
                  <CodeBlock>python my_server.py</CodeBlock>
                </div>
              </div>

              <h4 className="font-medium mb-2">2. Test Through Claude Code</h4>
              <p className="text-muted-foreground mb-2">In Claude Code, try these commands:</p>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-sm">For FastMCP dice example:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Ask: <em>"Roll some dice for me"</em></li>
                    <li>Claude will use your <code className="bg-slate-100 px-1 rounded">roll_dice</code> tool automatically</li>
                  </ul>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">For Supabase server:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><code className="bg-slate-100 px-1 rounded">greet("World")</code> - Test basic functionality</li>
                    <li><code className="bg-slate-100 px-1 rounded">read_from_table("claude_chat_logs")</code> - Test database connection</li>
                    <li><code className="bg-slate-100 px-1 rounded">log_chat_interaction("test query", "test response")</code> - Test logging</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <p className="text-green-800 font-medium text-sm">💡 Pro Tip</p>
                <p className="text-green-700 text-xs mt-1">
                  If your server provides resources, reference them with <code>@server:protocol://resource/path</code>. 
                  For prompts, use slash commands like <code>/mcp__servername__promptname</code>.
                </p>
              </div>
            </div>

            {/* Available Tools */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Available MCP Tools</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Database Operations</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                    <li><code>read_from_table(table_name, columns, filters, limit)</code></li>
                    <li><code>write_to_table(table_name, data)</code></li>
                    <li><code>update_in_table(table_name, filters, updates)</code></li>
                    <li><code>delete_from_table(table_name, filters)</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Chat Management</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                    <li><code>log_chat_interaction(user_query, claude_response, timestamp)</code></li>
                    <li><code>get_chat_history(limit, filter_user_id, filter_project_id, start_date, end_date)</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Utility</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                    <li><code>greet(name)</code> - Simple test function</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Troubleshooting</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-600">Common Issues</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-medium">"SUPABASE_URL and SUPABASE_KEY must be set"</p>
                      <ul className="list-disc list-inside text-muted-foreground ml-2">
                        <li>Check your <code>.env</code> file exists and has correct variable names</li>
                        <li>Ensure environment variables are properly loaded</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium">"Row Level Security policy violation"</p>
                      <ul className="list-disc list-inside text-muted-foreground ml-2">
                        <li>Use Service Role Key instead of Anon Key, or</li>
                        <li>Configure proper RLS policies in Supabase</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Verification Commands</h4>
                  <CodeBlock>
{`# Test Python environment
python --version
pip list | grep -E "(fastmcp|supabase)"

# Test environment variables
python -c "import os; print('SUPABASE_URL' in os.environ)"

# Test Supabase connection
python -c "from supabase import create_client; print('Connection test passed')"`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            {/* Security Best Practices */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Security Best Practices</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li><strong>Never commit sensitive keys</strong> - Add <code>.env</code> to <code>.gitignore</code></li>
                <li><strong>Use Service Role Key carefully</strong> - It bypasses all RLS policies</li>
                <li><strong>Implement RLS policies</strong> if using Anon Key for additional security</li>
                <li><strong>Regularly rotate keys</strong> in your Supabase project settings</li>
                <li><strong>Limit USER_ID and PROJECT_ID</strong> to prevent unauthorized access</li>
              </ol>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
              <p className="text-muted-foreground mb-2">Once setup is complete, you can:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Start logging Claude Code interactions automatically</li>
                <li>Query chat history for analysis</li>
                <li>Extend the MCP server with additional Supabase operations</li>
                <li>Implement custom filters and data processing</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MCPSetupGuide;