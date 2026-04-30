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
      <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-3">
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

      <div className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Business</span>
            </div>
            <p className="font-semibold text-foreground text-lg">{result.businessName}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Category</span>
            </div>
            <p className="font-semibold text-foreground text-lg">{result.mainCategory}</p>
          </div>

          {result.location && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Location</span>
              </div>
              <p className="font-semibold text-foreground text-lg">{result.location}</p>
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                {isEcommerce ? 'Products' : 'Services'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.productsOrServices.slice(0, 4).map((item, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium"
                >
                  {item}
                </span>
              ))}
              {result.productsOrServices.length > 4 && (
                <span className="px-2.5 py-1 text-muted-foreground text-sm font-medium">
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
