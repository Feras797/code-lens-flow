import { useState, useEffect } from 'react'
import { useCompanies, useFacilities } from '@/hooks/useSupabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, MapPin, AlertCircle, Plus, Globe } from 'lucide-react'

export function CompaniesOverview() {
  const { data: companies, isLoading: loadingCompanies, error: companiesError } = useCompanies()
  const { data: facilities, isLoading: loadingFacilities, error: facilitiesError } = useFacilities()
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  // Group facilities by company
  const facilitiesByCompany = facilities?.reduce((acc, facility) => {
    if (!acc[facility.company_id]) {
      acc[facility.company_id] = []
    }
    acc[facility.company_id].push(facility)
    return acc
  }, {} as Record<string, any[]>) || {}

  if (loadingCompanies) {
    return (
      <div className='p-6 space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-48 mt-2' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-20 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (companiesError) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Failed to load companies: {companiesError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!companies || companies.length === 0) {
    return (
      <div className='p-6'>
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Building2 className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Companies Found</h3>
            <p className='text-muted-foreground text-center mb-4'>
              Get started by adding your first company to monitor.
            </p>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Add Company
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>Companies Overview</h2>
          <p className='text-muted-foreground mt-1'>
            Monitor environmental impact across all tracked companies
          </p>
        </div>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          Add Company
        </Button>
      </div>

      {/* Companies Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {companies.map((company) => {
          const companyFacilities = facilitiesByCompany[company.id] || []
          const isSelected = selectedCompany === company.id

          return (
            <Card
              key={company.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCompany(isSelected ? null : company.id)}
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Building2 className='h-5 w-5' />
                      {company.name}
                    </CardTitle>
                    <CardDescription className='mt-1'>
                      {company.description || 'No description available'}
                    </CardDescription>
                  </div>
                  {company.logo_url && (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className='h-10 w-10 rounded object-contain'
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {/* Facilities Count */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Facilities</span>
                    <Badge variant='secondary'>
                      <MapPin className='h-3 w-3 mr-1' />
                      {companyFacilities.length}
                    </Badge>
                  </div>

                  {/* Quick Stats */}
                  <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Impact Score</p>
                      <p className='text-sm font-semibold'>
                        {Math.floor(Math.random() * 30 + 70)}/100
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Trend</p>
                      <p className='text-sm font-semibold text-green-600'>
                        ↓ 5% improved
                      </p>
                    </div>
                  </div>

                  {/* Facilities Preview */}
                  {isSelected && companyFacilities.length > 0 && (
                    <div className='pt-3 border-t space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Active Facilities:
                      </p>
                      {companyFacilities.slice(0, 3).map((facility) => (
                        <div
                          key={facility.id}
                          className='flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1'
                        >
                          <Globe className='h-3 w-3' />
                          <span className='flex-1 truncate'>{facility.name}</span>
                          <span className='text-muted-foreground'>
                            {facility.location_name}
                          </span>
                        </div>
                      ))}
                      {companyFacilities.length > 3 && (
                        <p className='text-xs text-muted-foreground text-center'>
                          +{companyFacilities.length - 3} more facilities
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 mt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('View on map:', company.id)
                    }}
                  >
                    View on Map
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('View report:', company.id)
                    }}
                  >
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
