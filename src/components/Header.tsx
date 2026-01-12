import { Menu, Search } from 'lucide-react'
import UserMenu from './UserMenu'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="relative z-50 border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-4 lg:hidden'>
              {/* Mobile Menu Button */}
              <button
                onClick={onMenuClick}
                className="text-foreground hover:text-primary transition-colors p-1 hover:bg-muted/50 rounded-md cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>  

              <img
                src="/images/colosseum-sm-logo.png"
                alt="Colosseum"
                className="h-8 w-auto flex-shrink-0"
              />        
            </div>              

            {/* Search Bar */}
            <div className="flex-1 lg:w-96 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Colosseum..."
                className="w-full pl-10 pr-4 py-2.5 bg-input/50 border border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                /
              </div>
            </div>
          </div>            

          {/* User Menu / Sign In Button */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

