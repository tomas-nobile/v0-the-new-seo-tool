'use client'

import { ShoppingBag, Globe, MapPin, Package, Building2, Tag } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface SiteDetectionBannerProps {
  result: AnalysisResult
}

export function SiteDetectionBanner({ result }: SiteDetectionBannerProps) {
  const isEcommerce = result.siteType === 'ecommerce'
  const Icon = isEcommerce ? ShoppingBag : Globe

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {isEcommerce ? 'E-commerce Store' : 'Business Website'}
          </h3>
          <p className="text-sm text-muted-foreground">Detected site type</p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Business</span>
            </div>
            <p className="font-semibold text-foreground text-sm leading-snug">{result.businessName}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Category</span>
            </div>
            <p className="font-semibold text-foreground text-sm leading-snug">{result.mainCategory}</p>
          </div>

          {result.location && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Location</span>
              </div>
              <p className="font-semibold text-foreground text-sm leading-snug">{result.location}</p>
            </div>
          )}

          <div className={`space-y-1 ${result.location ? 'col-span-1' : 'col-span-2'}`}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">
                {isEcommerce ? 'Products' : 'Services'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {result.productsOrServices.slice(0, 4).map((item, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md font-medium"
                >
                  {item}
                </span>
              ))}
              {result.productsOrServices.length > 4 && (
                <span className="px-2 py-0.5 text-muted-foreground text-xs font-medium">
                  +{result.productsOrServices.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
