import { Link2, Sparkles, Download } from 'lucide-react'

const steps = [
  {
    icon: Link2,
    number: '01',
    title: 'Paste your URL',
    description: 'We scan your entire website to understand your business, products, and services.',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'AI Analysis',
    description: 'Claude detects gaps in your AI visibility and identifies optimization opportunities.',
  },
  {
    icon: Download,
    number: '03',
    title: 'Get your page',
    description: 'Download a ready-to-upload HTML page that gets you cited by AI agents.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get your business cited by AI agents in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-border">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
