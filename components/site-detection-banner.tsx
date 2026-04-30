'use client'

import { ShoppingBag, Globe, MapPin, Package, Building2 } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface SiteDetectionBannerProps {
  result: AnalysisResult
}

export function SiteDetectionBanner({ result }: SiteDetectionBannerProps) {
  const isEcommerce = result.siteType === 'ecommerce'
  const Icon = isEcommerce ? ShoppingBag : Globe

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">
          {isEcommerce ? 'Ecommerce detected' : 'Business website detected'}
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Business Name</span>
          </div>
          <p className="font-medium">{result.businessName}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">Category</span>
          </div>
          <p className="font-medium">{result.mainCategory}</p>
        </div>

        {result.location && (
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Location</span>
            </div>
            <p className="font-medium">{result.location}</p>
          </div>
        )}

        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">{isEcommerce ? 'Products' : 'Services'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.productsOrServices.slice(0, 3).map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
              >
                {item}
              </span>
            ))}
            {result.productsOrServices.length > 3 && (
              <span className="px-2 py-1 text-muted-foreground text-sm">
                +{result.productsOrServices.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
