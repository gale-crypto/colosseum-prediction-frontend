import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Trophy, Gem, FileText, TrendingUp, Activity, Building2, Gamepad2, Palette, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  isCollapsed: boolean,
  onMenuClick: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ isCollapsed, onMenuClick, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const topics = [
    { name: 'Crypto', icon: TrendingUp, count: 24, color: 'text-yellow-400' },
    { name: 'Sports', icon: Activity, count: 9, color: 'text-blue-400' },
    { name: 'Politics', icon: Building2, count: 12, color: 'text-purple-400' },
    { name: 'Gaming', icon: Gamepad2, count: 7, color: 'text-green-400' },
    { name: 'Culture', icon: Palette, count: 5, color: 'text-pink-400' },
  ]

  const [isHovered, setIsHovered] = useState(false)

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-overlay-overlay z-40 lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed
        left-0 top-0
        z-50 lg:z-10
        flex flex-col
        bg-card/95 lg:bg-card/50
        border-r border-border/30
        backdrop-blur-sm
        h-screen
        overflow-y-auto
        transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
        shadow-xl lg:shadow-none
      `}>
      <div className={`p-6 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
        {/* Logo and Close Button */}
        <div 
        className={`flex items-center justify-between mb-8 transition-all ${isCollapsed ? 'justify-center' : ''}`}
        onMouseOver={() => {setIsHovered(true)}}
        onMouseOut={() => {setIsHovered(false)}}          
        >
          <Link 
            to="/" 
            className={`flex items-center gap-3 transition-all group relative ${isCollapsed ? 'justify-center' : ''}`}
            onClick={handleLinkClick}
          >
            {isCollapsed ? 
            <img
              src="/images/colosseum-sm-logo.png"
              alt="Colosseum"
              className={`h-8 w-auto flex-shrink-0 ${isHovered ? 'hidden' : ''}`}
            />
            :
            <img 
              src="/images/colosseum-logo.png" 
              alt="Colosseum" 
              className="h-8 w-auto flex-shrink-0"
            />}
          </Link>
          
          {/* Desktop Menu Button / Mobile Close Button */}
          <div className={`flex items-center gap-2 ${(isCollapsed && !isHovered) ? 'hidden' : ''}`}>
            {/* Mobile Close Button */}
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="lg:hidden text-foreground hover:text-primary transition-colors p-1 hover:bg-muted/50 rounded-md cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            
            {/* Desktop Menu Button */}
            <button
              onClick={onMenuClick}
              className={`hidden lg:block text-foreground hover:text-primary transition-colors p-1 hover:bg-muted/50 rounded-md cursor-pointer ${isCollapsed && !isHovered ? 'hidden' : ''}`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className={`space-y-2 mb-8 ${isCollapsed ? 'space-y-3' : ''}`}>
          <Link
            to="/markets"
            onClick={handleLinkClick}
            className={`flex items-center rounded-full transition-colors group relative ${
              isCollapsed 
                ? 'justify-center px-3 py-3' 
                : 'gap-3 px-4 py-3'
            } ${
              isActive('/markets') || isActive('/')
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Markets</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Markets
              </span>
            )}
          </Link>
          <Link
            to="/leaderboard"
            onClick={handleLinkClick}
            className={`flex items-center rounded-full transition-colors group relative ${
              isCollapsed 
                ? 'justify-center px-3 py-3' 
                : 'gap-3 px-4 py-3'
            } ${
              isActive('/leaderboard')
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Trophy className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Leaderboard</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Leaderboard
              </span>
            )}
          </Link>
          <Link
            to="/earn"
            onClick={handleLinkClick}
            className={`flex items-center rounded-full transition-colors group relative ${
              isCollapsed 
                ? 'justify-center px-3 py-3' 
                : 'gap-3 px-4 py-3'
            } ${
              isActive('/earn')
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Gem className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Earn</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Earn
              </span>
            )}
          </Link>
          <Link
            to="/news"
            onClick={handleLinkClick}
            className={`flex items-center rounded-full transition-colors group relative ${
              isCollapsed 
                ? 'justify-center px-3 py-3' 
                : 'gap-3 px-4 py-3'
            } ${
              isActive('/news')
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">News</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                News
              </span>
            )}
          </Link>
        </nav>

        {/* Topics Section */}
        <div className="border-t border-border/30 pt-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
              Topics
            </h3>
          )}
          <div className={`space-y-2 ${isCollapsed ? 'space-y-3' : ''}`}>
            {topics.map((topic) => {
              const Icon = topic.icon
              return (
                <Link
                  key={topic.name}
                  to={`/markets?category=${topic.name.toLowerCase()}`}
                  onClick={handleLinkClick}
                  className={`flex items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group relative ${
                    isCollapsed 
                      ? 'justify-center px-3 py-2.5' 
                      : 'justify-between px-4 py-2.5'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${topic.color}`} />
                    {!isCollapsed && <span className="font-medium">{topic.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-xs text-muted-foreground group-hover:text-foreground">
                      {topic.count}
                    </span>
                  )}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {topic.name} ({topic.count})
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

