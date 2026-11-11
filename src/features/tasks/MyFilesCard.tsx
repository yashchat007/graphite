import { FileText, Image, File } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'

const FILES = [
  { name: 'Roadmap_Q1.pdf', size: '2.4 MB', icon: FileText },
  { name: 'UI_exploration.fig', size: '8.1 MB', icon: Image },
  { name: 'Notes_archive.md', size: '12 KB', icon: File },
]

export function MyFilesCard() {
  return (
    <GlassCard className="p-5">
      <h2 className="mb-3 text-sm font-semibold text-[#F2F2F3]">My files</h2>
      <ul className="space-y-2">
        {FILES.map((f) => (
          <li
            key={f.name}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
          >
            <f.icon className="h-4 w-4 text-[#8A8A8F]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[#C7C7CC]">{f.name}</p>
              <p className="text-[10px] text-[#5A5A60]">{f.size}</p>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}
