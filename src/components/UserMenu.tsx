import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppKitAccount, useAppKit, useDisconnect } from '@reown/appkit/react'
import { 
  User, 
  Settings, 
  Share2, 
  HelpCircle, 
  LogOut
} from 'lucide-react'

export default function UserMenu() {
  const { address, isConnected } = useAppKitAccount()
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnect()
    setIsOpen(false)
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => open()}
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full text-primary font-medium transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer p-1 m-1 overflow-hidden rounded-full border border-transparent bg-[#2b303a] hover:bg-bg-weak-50 hover:border-alpha-neutral-v2-alpha-10 transition-colors duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold"/>
          {/* {address.charAt(2).toUpperCase()} */}
        {/* </div>
        <span className="hidden sm:inline text-sm font-medium">{formatAddress(address)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /> */}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Profile Card */}
          <div className="p-4 bg-muted/30 border-b border-border/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {address.charAt(2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {formatAddress(address)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">0%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Complete profile</div>
                <div className="text-xs text-muted-foreground">12 steps left</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Claim SZN 1</span>
            </button> */}
            {/* <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Restore PRE-SZN</span>
            </button> */}
            <button 
              onClick={() => {
                navigate('/profile')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
              <Share2 className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Share To Earn</span>
            </button>
            <button 
              onClick={() => {
                navigate('/settings')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Help & Feedback</span>
            </button>
            <div className="border-t border-border/30 my-2"></div>
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

