import { useEffect, useRef } from 'react'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type LineData, type Time } from 'lightweight-charts'

interface PriceChartProps {
  upData: { time: Time; value: number }[]
  downData: { time: Time; value: number }[]
  upColor?: string
  downColor?: string
  height?: number
}

export default function PriceChart({ 
  upData,
  downData,
  upColor = '#FF68B3', // primary color
  downColor = '#3FDECC', // secondary color
  height = 400 
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const upSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const downSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#809ddd',
      },
      grid: {
        vertLines: { color: '#291f184d' },
        horzLines: { color: '#291f184d' },
      },
      crosshair: {
        mode: 0,
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
      title: 'UP',
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
      title: 'DOWN',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    upSeriesRef.current = upSeries
    downSeriesRef.current = downSeries

    // Set data
    upSeries.setData(upData as LineData[])
    downSeries.setData(downData as LineData[])

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [height, upColor, downColor])

  useEffect(() => {
    if (upSeriesRef.current && upData.length > 0) {
      upSeriesRef.current.setData(upData as LineData[])
    }
  }, [upData])

  useEffect(() => {
    if (downSeriesRef.current && downData.length > 0) {
      downSeriesRef.current.setData(downData as LineData[])
    }
  }, [downData])

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  )
}
