import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import MCPSetupGuide from './MCPSetupGuide';

const MCPSetupButton: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowGuide(true)}
        className="gap-2 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
      >
        <Terminal className="h-3 w-3" />
        Setup MCP for CLI
      </Button>
      
      <MCPSetupGuide 
        open={showGuide} 
        onOpenChange={setShowGuide} 
      />
    </>
  );
};

export default MCPSetupButton;