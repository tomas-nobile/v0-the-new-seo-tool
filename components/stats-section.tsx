import { MessageSquare, EyeOff, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: MessageSquare,
    stat: '200M+',
    label: 'ChatGPT has 200M+ weekly users searching for products',
  },
  {
    icon: EyeOff,
    stat: '93%',
    label: '93% of websites are invisible to AI agents',
  },
  {
    icon: TrendingUp,
    stat: '3x',
    label: 'Businesses cited by AI get 3x more qualified traffic',
  },
]

export function StatsSection() {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="group p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{item.stat}</div>
              <p className="text-muted-foreground leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
