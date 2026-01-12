import { Menu, Search } from 'lucide-react'
import UserMenu from './UserMenu'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="relative z-50 border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0">
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className='flex items-center gap-2 sm:gap-4 flex-1 min-w-0'>
            <div className='flex items-center gap-2 sm:gap-4 lg:hidden flex-shrink-0'>
              {/* Mobile Menu Button */}
              <button
                onClick={onMenuClick}
                className="text-foreground hover:text-primary transition-colors p-1 hover:bg-muted/50 rounded-md cursor-pointer flex-shrink-0"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>  

              <img
                src="/images/colosseum-sm-logo.png"
                alt="Colosseum"
                className="h-7 sm:h-8 w-auto flex-shrink-0"
              />        
            </div>              

            {/* Search Bar */}
            <div className="lg:w-96 relative min-w-0">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-12 py-2 sm:py-2.5 bg-input/50 border border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm text-xs sm:text-sm"
              />
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hidden sm:block">
                /
              </div>
            </div>
          </div>            

          {/* User Menu / Sign In Button */}
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

