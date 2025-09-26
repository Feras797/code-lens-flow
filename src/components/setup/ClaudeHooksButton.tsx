import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import ClaudeHooksGuide from './ClaudeHooksGuide';

const ClaudeHooksButton: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowGuide(true)}
        className="gap-2 text-xs hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
      >
        <Settings className="h-3 w-3" />
        Setup Claude Hooks
      </Button>
      
      <ClaudeHooksGuide 
        open={showGuide} 
        onOpenChange={setShowGuide} 
      />
    </>
  );
};

export default ClaudeHooksButton;