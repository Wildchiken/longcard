'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { createZineCanvas, resizeCanvas } from '@/lib/fabric/canvas-factory'
import { serializeCanvas, syncLayersFromCanvas } from '@/lib/fabric/serialization'
import type { ZineFormat } from '@/types/zine'

interface ZineCanvasProps {
  format: ZineFormat
  initialJSON?: string
}

export function ZineCanvas({ format, initialJSON }: ZineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { setFabricCanvas, setActiveObject, setLayers, pushHistory } = useEditorStore()
  const fabricCanvasRef = useRef<any>(null)

  const handleObjectSelected = useCallback((e: any) => {
    const obj = e.selected?.[0]
    if (obj) {
      setActiveObject(obj.id ?? null, obj.layerType ?? null)
    }
  }, [setActiveObject])

  const handleSelectionCleared = useCallback(() => {
    setActiveObject(null, null)
  }, [setActiveObject])

  const handleModified = useCallback(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const json = serializeCanvas(canvas)
    pushHistory(json)
    setLayers(syncLayersFromCanvas(canvas))
  }, [pushHistory, setLayers])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const containerWidth = containerRef.current.clientWidth

    let canvas: any

    createZineCanvas(canvasRef.current, format, containerWidth).then(async (c) => {
      canvas = c
      fabricCanvasRef.current = c
      setFabricCanvas(c)

      c.on('selection:created', handleObjectSelected)
      c.on('selection:updated', handleObjectSelected)
      c.on('selection:cleared', handleSelectionCleared)
      c.on('object:modified', handleModified)
      c.on('object:added', handleModified)
      c.on('object:removed', handleModified)

      if (initialJSON) {
        const { deserializeCanvas } = await import('@/lib/fabric/serialization')
        await deserializeCanvas(c, initialJSON)
        setLayers(syncLayersFromCanvas(c))
      }

      // Push initial state
      pushHistory(serializeCanvas(c))
    })

    const resizeObserver = new ResizeObserver(() => {
      if (canvas && containerRef.current) {
        resizeCanvas(canvas, containerRef.current.clientWidth)
      }
    })
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (canvas) {
        canvas.off('selection:created', handleObjectSelected)
        canvas.off('selection:updated', handleObjectSelected)
        canvas.off('selection:cleared', handleSelectionCleared)
        canvas.off('object:modified', handleModified)
        canvas.off('object:added', handleModified)
        canvas.off('object:removed', handleModified)
        canvas.dispose()
        setFabricCanvas(null)
        fabricCanvasRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format])

  return (
    <div
      ref={containerRef}
      className="w-full flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden shadow-xl"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
