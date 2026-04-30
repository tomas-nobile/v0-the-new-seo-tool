export function Footer({ modelUsed }: { modelUsed?: string }) {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            {modelUsed ? `Analyzed with ${modelUsed}` : 'Built for the AI-first web'}
          </p>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Made by{' '}
            <a 
              href="https://tomasnobile.com.ar/en/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary/80 transition-colors underline"
            >
              Tomas Nobile
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
