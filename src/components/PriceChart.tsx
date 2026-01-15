import { useEffect, useRef } from 'react'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type LineData, type Time } from 'lightweight-charts'

interface PriceChartProps {
  upData: { time: Time; value: number }[]
  downData: { time: Time; value: number }[]
  upColor?: string
  downColor?: string
  height?: number
  upLabel?: string
  downLabel?: string
  onHover?: (data: { yesPrice: number; noPrice: number; time: Time | null } | null) => void
}

export default function PriceChart({ 
  upData = [],
  downData = [],
  upColor = '#3FDECC', // primary color
  downColor = '#FF68B3', // secondary color
  height = 400,
  upLabel = 'UP',
  downLabel = 'DOWN',
  onHover
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const upSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const downSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const upDataRef = useRef(upData)
  const downDataRef = useRef(downData)
  const onHoverRef = useRef(onHover)

  // Initialize chart (only once on mount)
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return

    // Ensure container has dimensions
    const containerWidth = chartContainerRef.current.clientWidth || chartContainerRef.current.offsetWidth || 800
    const containerHeight = height || 400

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#809ddd',
      },
      grid: {
        vertLines: { color: '#291f184d' },
        horzLines: { color: '#291f184d' },
      },
      crosshair: {
        mode: 1, // Enable crosshair for hover
        vertLine: {
          color: '#809ddd',
          width: 1,
          style: 2, // Dashed line
          labelBackgroundColor: '#1a1a1a',
        },
        horzLine: {
          color: '#809ddd',
          width: 1,
          style: 2, // Dashed line
          labelBackgroundColor: '#1a1a1a',
        },
      },
      rightPriceScale: {
        borderColor: '#4e341f4d',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#4e341f4d',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
        barSpacing: 3,
        fixLeftEdge: true, // Don't fix initially, will fix after data loads
        fixRightEdge: true, // Don't fix initially, will fix after data loads
        rightBarStaysOnScroll: false,
        lockVisibleTimeRangeOnResize: false, // Don't lock until data is loaded
        shiftVisibleRangeOnNewBar: false,
      },
      // Disable all interactions (panning, zooming, scaling)
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
        horzTouchDrag: false,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: false,
        axisDoubleClickReset: false,
        mouseWheel: false,
        pinch: false,
      },
    })

    chartRef.current = chart

    // Create UP line series
    const upSeries = chart.addSeries(LineSeries, {
      color: upColor,
      lineWidth: 2,
      title: upLabel,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // Create DOWN line series
    const downSeries = chart.addSeries(LineSeries, {
      color: downColor,
      lineWidth: 2,
      title: downLabel,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    upSeriesRef.current = upSeries
    downSeriesRef.current = downSeries

    // Create tooltip element - append to body to avoid interfering with chart
    const tooltip = document.createElement('div')
    tooltip.className = 'chart-tooltip'
    tooltip.style.cssText = `
      position: fixed;
      display: none;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      pointer-events: none;
      z-index: 10000;
      font-size: 12px;
      color: #000000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 140px;
      will-change: transform;
    `
    document.body.appendChild(tooltip)
    tooltipRef.current = tooltip

    // Handle crosshair move (hover)
    const handleCrosshairMove = (param: any) => {
      // Guard: Don't process if chart is not ready
      if (!chartRef.current || !upSeriesRef.current || !downSeriesRef.current) {
        return
      }

      if (!param.point || !param.time) {
        // Mouse left the chart
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none'
        }
        if (onHoverRef.current) {
          onHoverRef.current(null)
        }
        return
      }

      // Get prices at the hovered time from series data
      const hoveredTime = param.time
      let yesPrice = 0
      let noPrice = 0

      // Get data directly from series (more accurate)
      if (param.seriesData && upSeriesRef.current) {
        const upDataPoint = param.seriesData.get(upSeriesRef.current)
        if (upDataPoint && 'value' in upDataPoint) {
          yesPrice = (upDataPoint.value as number) / 100 // Convert from percentage to decimal
        }
      }

      if (param.seriesData && downSeriesRef.current) {
        const downDataPoint = param.seriesData.get(downSeriesRef.current)
        if (downDataPoint && 'value' in downDataPoint) {
          noPrice = (downDataPoint.value as number) / 100 // Convert from percentage to decimal
        }
      }

      // Fallback: if series data not available, find closest point
      if ((yesPrice === 0 && noPrice === 0) && hoveredTime) {
        const hoverTimeNum = typeof hoveredTime === 'number' 
          ? hoveredTime 
          : new Date(hoveredTime as string).getTime() / 1000

        // Find closest point in upData (use ref to get current data)
        const currentUpData = upDataRef.current
        if (currentUpData && currentUpData.length > 0) {
          let closest = currentUpData[0]
          let minDiff = Math.abs((typeof closest.time === 'number' ? closest.time : new Date(closest.time as string).getTime() / 1000) - hoverTimeNum)
          
          for (const point of currentUpData) {
            const time = typeof point.time === 'number' ? point.time : new Date(point.time as string).getTime() / 1000
            const diff = Math.abs(time - hoverTimeNum)
            if (diff < minDiff) {
              minDiff = diff
              closest = point
            }
          }
          
          if (minDiff < 3600) { // Within 1 hour
            yesPrice = closest.value / 100
          }
        }

        // Find closest point in downData (use ref to get current data)
        const currentDownData = downDataRef.current
        if (currentDownData && currentDownData.length > 0) {
          let closest = currentDownData[0]
          let minDiff = Math.abs((typeof closest.time === 'number' ? closest.time : new Date(closest.time as string).getTime() / 1000) - hoverTimeNum)
          
          for (const point of currentDownData) {
            const time = typeof point.time === 'number' ? point.time : new Date(point.time as string).getTime() / 1000
            const diff = Math.abs(time - hoverTimeNum)
            if (diff < minDiff) {
              minDiff = diff
              closest = point
            }
          }
          
          if (minDiff < 3600) { // Within 1 hour
            noPrice = closest.value / 100
          }
        }
      }

      // If we found prices, update tooltip and callback
      if (yesPrice > 0 || noPrice > 0) {
        // Format timestamp
        const timestamp = typeof hoveredTime === 'number' 
          ? new Date(hoveredTime * 1000)
          : new Date(hoveredTime as string)
        const timeStr = timestamp.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })

        // Update tooltip content (white background with dark text to match image)
        if (!tooltipRef.current) return
        tooltipRef.current.innerHTML = `
          <div style="color: #6b7280; margin-bottom: 8px; font-size: 11px; font-weight: 500;">${timeStr}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${upColor}; flex-shrink: 0;"></div>
              <span style="font-weight: 600; color: #000;">${upLabel}</span>
            </div>
            <span style="font-weight: 600; color: #000;">${(yesPrice * 100).toFixed(1)}%</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${downColor}; flex-shrink: 0;"></div>
              <span style="font-weight: 600; color: #000;">${downLabel}</span>
            </div>
            <span style="font-weight: 600; color: #000;">${(noPrice * 100).toFixed(1)}%</span>
          </div>
        `

        // Position tooltip near the crosshair (using fixed positioning relative to viewport)
        if (chartContainerRef.current && param.point && tooltipRef.current) {
          // Get container position relative to viewport
          const containerRect = chartContainerRef.current.getBoundingClientRect()
          
          // Calculate tooltip position relative to viewport
          const tooltipX = containerRect.left + param.point.x + 15
          const tooltipY = containerRect.top + param.point.y - 80
          
          // Ensure tooltip stays within viewport bounds
          const maxX = window.innerWidth - 160 // Tooltip width approx + margin
          const maxY = window.innerHeight - 100 // Tooltip height approx + margin
          
          tooltipRef.current.style.left = `${Math.max(10, Math.min(tooltipX, maxX))}px`
          tooltipRef.current.style.top = `${Math.max(10, Math.min(tooltipY, maxY))}px`
          tooltipRef.current.style.display = 'block'
        }

        // Call callback to update probability display
        if (onHoverRef.current) {
          onHoverRef.current({
            yesPrice,
            noPrice,
            time: hoveredTime
          })
        }
      }
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current && upSeriesRef.current && downSeriesRef.current) {
        try {
          const containerWidth = chartContainerRef.current.clientWidth || chartContainerRef.current.offsetWidth || 800
          chartRef.current.applyOptions({
            width: containerWidth,
          })
          // Re-fit content after resize to ensure all data is visible
          requestAnimationFrame(() => {
            if (chartRef.current && upSeriesRef.current && downSeriesRef.current) {
              try {
                const timeScale = chartRef.current.timeScale()
                timeScale.fitContent()
              } catch (error) {
                console.error('Error fitting content on resize:', error)
              }
            }
          })
        } catch (error) {
          console.error('Error handling resize:', error)
        }
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      // Remove tooltip from body
      if (tooltipRef.current && tooltipRef.current.parentNode === document.body) {
        document.body.removeChild(tooltipRef.current)
      }
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        upSeriesRef.current = null
        downSeriesRef.current = null
      }
    }
  }, []) // Only run once on mount - don't recreate chart when props change

  // Keep refs in sync with current data and callbacks
  useEffect(() => {
    upDataRef.current = upData
    downDataRef.current = downData
    onHoverRef.current = onHover
  }, [upData, downData, onHover])

  // Update chart data when it changes
  useEffect(() => {
    if (!chartRef.current || !upSeriesRef.current || !downSeriesRef.current) return

    // Update UP series
    if (upData && upData.length > 0) {
      // Ensure data is sorted by time
      const sortedUpData = [...upData].sort((a, b) => {
        const timeA = typeof a.time === 'number' ? a.time : new Date(a.time as string).getTime() / 1000
        const timeB = typeof b.time === 'number' ? b.time : new Date(b.time as string).getTime() / 1000
        return timeA - timeB
      })
      upSeriesRef.current.setData(sortedUpData as LineData[])
    } else {
      upSeriesRef.current.setData([])
    }

    // Update DOWN series
    if (downData && downData.length > 0) {
      // Ensure data is sorted by time
      const sortedDownData = [...downData].sort((a, b) => {
        const timeA = typeof a.time === 'number' ? a.time : new Date(a.time as string).getTime() / 1000
        const timeB = typeof b.time === 'number' ? b.time : new Date(b.time as string).getTime() / 1000
        return timeA - timeB
      })
      downSeriesRef.current.setData(sortedDownData as LineData[])
    } else {
      downSeriesRef.current.setData([])
    }

    // Fit content to show ALL data from start to end without scrolling
    if (chartRef.current && ((upData && upData.length > 0) || (downData && downData.length > 0))) {
      // Use requestAnimationFrame to ensure chart is ready
      requestAnimationFrame(() => {
        if (chartRef.current && upSeriesRef.current && downSeriesRef.current) {
          try {
            const timeScale = chartRef.current.timeScale()
            
            // Fit content to show all data from start to end
            // This automatically adjusts the view to show all data points
            timeScale.fitContent()
          } catch (error) {
            console.error('Error fitting chart content:', error)
          }
        }
      })
    }
  }, [upData, downData])

  // Update height when it changes
  useEffect(() => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({
        height: height,
        width: chartContainerRef.current.clientWidth,
      })
    }
  }, [height])

  return (
    <div className="w-full" style={{ minHeight: `${height}px` }}>
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px`, minHeight: `${height}px` }} />
    </div>
  )
}
