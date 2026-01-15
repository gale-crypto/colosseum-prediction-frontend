import { useEffect, useState, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  valueSuffix?: string // For compatibility with number-flow-react
  formatter?: (value: number) => string
  className?: string
  'aria-label'?: string
  role?: string
}

export default function AnimatedNumber({
  value,
  duration = 800,
  decimals = 2,
  prefix = '',
  suffix = '',
  valueSuffix = '',
  formatter,
  className = '',
  'aria-label': ariaLabel,
  role = 'img'
}: AnimatedNumberProps) {
  // Initialize with the value, or 0 if value is NaN/undefined
  const safeValue = isNaN(value) || !isFinite(value) ? 0 : value
  const [displayValue, setDisplayValue] = useState(safeValue)
  const startValueRef = useRef(safeValue)
  const animationFrameRef = useRef<number | null>(null)
  const previousValueRef = useRef(safeValue)

  useEffect(() => {
    const safeValue = isNaN(value) || !isFinite(value) ? 0 : value
    
    // Only animate if value actually changed
    if (previousValueRef.current === safeValue) {
      return
    }

    startValueRef.current = displayValue
    previousValueRef.current = safeValue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const targetValue = safeValue
      const currentValue = startValueRef.current + (targetValue - startValueRef.current) * easeOut
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(targetValue)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [value, duration])

  // Format the display value
  const formatValue = (val: number): string => {
    if (formatter) {
      return formatter(val)
    }

    const rounded = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString()
    const finalSuffix = valueSuffix || suffix
    return `${prefix}${rounded}${finalSuffix}`
  }

  const formattedValue = formatValue(displayValue)
  const label = ariaLabel || formattedValue

  return (
    <span 
      className={className} 
      aria-label={label}
      role={role}
      data-value={displayValue}
    >
      {formattedValue}
    </span>
  )
}

