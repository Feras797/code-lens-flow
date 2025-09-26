import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FileCode, Clock, MessageSquare, GitBranch } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface WorkItem {
  id: string
  task: string
  file: string
  duration: string
  messages: number
  commits: number
  chatContext: string
  priority: 'high' | 'medium' | 'low'
}

interface DeveloperLite {
  id: number
  name: string
  status: 'flow' | 'slow' | 'stuck'
}

interface WorkItemDialogProps {
  item: WorkItem
  developer: DeveloperLite
  trigger: React.ReactNode
}

function getPriorityBadgeClasses (priority: WorkItem['priority']) {
  switch (priority) {
    case 'high':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'low':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
  }
}

export function WorkItemDialog ({ item, developer, trigger }: WorkItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium')
  const [isSummarizing, setIsSummarizing] = useState(false)

  useEffect(() => {
    if (!open) return
    if (summary) return
    let cancelled = false
    ;(async () => {
      setIsSummarizing(true)
      try {
        const { SimpleLLMAnalysis } = await import('@/services/simpleLLMAnalysis')
        const svc = new SimpleLLMAnalysis()
        const res = await svc.summarizeTicket({
          title: item.task,
          description: item.chatContext,
          status: item.priority,
          filePath: item.file
        })
        if (!cancelled) {
          setSummary(res.summary)
          setKeyPoints(res.key_points || [])
          setRisk(res.risk)
        }
      } catch (e) {
        if (!cancelled) {
          setSummary('Summary unavailable right now. Showing original message below.')
        }
      } finally {
        if (!cancelled) setIsSummarizing(false)
      }
    })()
    return () => { cancelled = true }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className='max-w-4xl bg-gray-900 border-gray-800'>
        <DialogHeader>
          <DialogTitle className='text-white flex items-center gap-2'>
            {item.task}
            <Badge variant='outline' className={getPriorityBadgeClasses(item.priority)}>
              {item.priority}
            </Badge>
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            {developer.name} • {developer.status.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='p-4 rounded-lg border border-purple-800/30 bg-purple-950/20'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-purple-200'>AI Summary</p>
              <Badge variant='outline' className={
                risk === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                risk === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                'bg-green-500/20 text-green-300 border-green-500/30'
              }>
                {risk} risk
              </Badge>
            </div>
            <p className='text-sm text-purple-100'>
              {isSummarizing ? 'Generating summary…' : summary || 'Generating summary…'}
            </p>
            {keyPoints.length > 0 && (
              <ul className='mt-3 list-disc list-inside text-xs text-purple-200 space-y-1'>
                {keyPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>

          <p className='text-sm text-gray-300'>{item.chatContext}</p>

          <div className='flex items-center gap-3 text-sm text-gray-400'>
            <FileCode className='h-4 w-4' />
            <code className='font-mono'>{item.file}</code>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='p-3 rounded border border-gray-700 bg-gray-800'>
              <div className='text-xs text-gray-400 flex items-center gap-2'>
                <Clock className='h-3 w-3' /> Time Spent
              </div>
              <div className='text-white font-medium mt-1'>{item.duration}</div>
            </div>
            <div className='p-3 rounded border border-gray-700 bg-gray-800'>
              <div className='text-xs text-gray-400 flex items-center gap-2'>
                <MessageSquare className='h-3 w-3' /> Conversations
              </div>
              <div className='text-white font-medium mt-1'>{item.messages}</div>
            </div>
            <div className='p-3 rounded border border-gray-700 bg-gray-800'>
              <div className='text-xs text-gray-400 flex items-center gap-2'>
                <GitBranch className='h-3 w-3' /> Commits
              </div>
              <div className='text-white font-medium mt-1'>{item.commits}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WorkItemDialog


