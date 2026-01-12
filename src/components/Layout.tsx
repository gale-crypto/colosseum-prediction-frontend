import { useState, type ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 colosseum-bg opacity-20"></div>
      <div className="fixed inset-0 z-0 bg-background"></div>
      
      <div className="relative z-10 flex min-h-screen">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <Header onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

