import { useEffect, useRef } from 'react'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type LineData, type Time } from 'lightweight-charts'

interface PriceChartProps {
  data: { time: Time; value: number }[]
  upColor?: string
  downColor?: string
  height?: number
}

export default function PriceChart({ 
  data, 
  upColor = '#e99b2a', // primary color
  downColor = '#c97847', // secondary color
  height = 400 
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)

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
    })

    chartRef.current = chart

    // Create line series
    const lineSeries = chart.addSeries(LineSeries, {
      color: upColor,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    seriesRef.current = lineSeries

    // Set data
    lineSeries.setData(data as LineData[])

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
  }, [data, height, upColor, downColor])

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data as LineData[])
    }
  }, [data])

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  )
}

