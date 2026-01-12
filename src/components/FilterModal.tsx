import { useState, useRef, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface FilterModalProps {
  filters: FilterOption[]
  activeFilter: string
  onFilterChange: (filterId: string) => void
  tokenOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  selectedToken: string
  selectedStatus: string
  onTokenChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function FilterModal({
  filters,
  activeFilter,
  onFilterChange,
  tokenOptions,
  statusOptions,
  selectedToken,
  selectedStatus,
  onTokenChange,
  onStatusChange,
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`xl:hidden flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
          isOpen
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-overlay-overlay z-40 lg:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Modal */}
          <div
            ref={modalRef}
            className="fixed inset-x-4 top-20 bg-card border border-border/50 rounded-2xl shadow-lg z-50 lg:hidden p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon
                  return (
                    <button
                      key={filter.id}
                      onClick={() => {
                        onFilterChange(filter.id)
                        setIsOpen(false)
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                        activeFilter === filter.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{filter.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dropdowns */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Token</h4>
                <div className="flex flex-wrap gap-2">
                  {tokenOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onTokenChange(option.value)
                        setIsOpen(false)
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedToken === option.value
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onStatusChange(option.value)
                        setIsOpen(false)
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedStatus === option.value
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

