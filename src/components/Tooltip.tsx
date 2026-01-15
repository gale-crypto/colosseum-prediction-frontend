import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProviderProps {
  children: ReactNode
  delayDuration?: number
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

interface TooltipProps {
  children: ReactNode
}

export function Tooltip({ children }: TooltipProps) {
  return <>{children}</>
}

interface TooltipTriggerProps {
  children: ReactNode
  asChild?: boolean
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = triggerRef.current
    if (!element) return

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      data-tooltip-hovered={isHovered}
      className="inline-block"
    >
      {children}
    </span>
  )
}

interface TooltipContentProps {
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  className?: string
}

export function TooltipContent({ 
  children, 
  side = 'top', 
  sideOffset = 8,
  className = '' 
}: TooltipContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const checkHover = () => {
      const trigger = document.querySelector('[data-tooltip-hovered="true"]') as HTMLElement
      if (trigger) {
        setIsVisible(true)
        updatePosition(trigger)
      } else {
        setIsVisible(false)
      }
    }

    const updatePosition = (trigger: HTMLElement) => {
      if (!tooltipRef.current) return

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        if (!tooltipRef.current) return

        const triggerRect = trigger.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        // Use getBoundingClientRect() which gives viewport-relative positions
        // This automatically accounts for scroll position
        let top = 0
        let left = 0

        switch (side) {
          case 'top':
            top = triggerRect.top - tooltipRect.height - sideOffset
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'bottom':
            top = triggerRect.bottom + sideOffset
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'left':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            left = triggerRect.left - tooltipRect.width - sideOffset
            break
          case 'right':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            left = triggerRect.right + sideOffset
            break
        }

        // Keep tooltip within viewport
        const padding = 8
        if (left < padding) left = padding
        if (left + tooltipRect.width > window.innerWidth - padding) {
          left = window.innerWidth - tooltipRect.width - padding
        }
        if (top < padding) {
          // If tooltip would be above viewport, show below instead
          if (side === 'top') {
            top = triggerRect.bottom + sideOffset
          } else {
            top = padding
          }
        }
        if (top + tooltipRect.height > window.innerHeight - padding) {
          // If tooltip would be below viewport, show above instead
          if (side === 'bottom') {
            top = triggerRect.top - tooltipRect.height - sideOffset
          } else {
            top = window.innerHeight - tooltipRect.height - padding
          }
        }

        setPosition({ top, left })
      })
    }

    const interval = setInterval(checkHover, 50)

    // Update position on scroll and resize
    const handleScroll = () => {
      const trigger = document.querySelector('[data-tooltip-hovered="true"]') as HTMLElement
      if (trigger && isVisible) {
        updatePosition(trigger)
      }
    }

    const handleResize = () => {
      const trigger = document.querySelector('[data-tooltip-hovered="true"]') as HTMLElement
      if (trigger && isVisible) {
        updatePosition(trigger)
      }
    }

    // Listen to scroll on window and all scrollable containers
    window.addEventListener('scroll', handleScroll, true) // Use capture phase
    window.addEventListener('resize', handleResize)
    
    // Also listen to scroll on document
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('scroll', handleScroll, true)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isVisible, side, sideOffset])

  if (!isVisible) return null

  return createPortal(
    <div
      ref={tooltipRef}
      className={`fixed z-[9999] px-3 py-1.5 text-xs bg-foreground text-background rounded-md shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 max-w-xs ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="tooltip"
    >
      {children}
      {/* Arrow */}
      <div
        className={`absolute w-2 h-2 bg-foreground rotate-45 ${
          side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
          side === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
          side === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
          'left-[-4px] top-1/2 -translate-y-1/2'
        }`}
      />
    </div>,
    document.body
  )
}
