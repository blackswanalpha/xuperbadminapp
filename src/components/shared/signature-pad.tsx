'use client'

import { useRef, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { colors } from '@/lib/theme/colors'

interface SignaturePadProps {
    label: string
    value: string
    onChange: (base64: string) => void
    disabled?: boolean
}

export default function SignaturePad({ label, value, onChange, disabled = false }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = canvas.offsetWidth
        canvas.height = 150

        // Set drawing styles
        ctx.strokeStyle = '#1a1a2e'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // If there's an existing value, load it
        if (value) {
            const img = new Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0)
                setHasSignature(true)
            }
            img.src = value
        }
    }, [value])

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()

        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            }
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        const { x, y } = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
        setIsDrawing(true)
        setHasSignature(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || disabled) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        const { x, y } = getCoordinates(e)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawing = () => {
        if (!isDrawing) return
        setIsDrawing(false)

        // Save as base64
        const canvas = canvasRef.current
        if (canvas && hasSignature) {
            const base64 = canvas.toDataURL('image/png')
            onChange(base64)
        }
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
        onChange('')
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium" style={{ color: colors.textSecondary }}>
                    {label}
                </label>
                {hasSignature && !disabled && (
                    <button
                        type="button"
                        onClick={clearSignature}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                        <Trash2 size={14} />
                        Clear
                    </button>
                )}
            </div>

            <div
                className="relative border-2 border-dashed rounded-lg overflow-hidden"
                style={{ borderColor: colors.borderLight, backgroundColor: disabled ? '#f5f5f5' : '#ffffff' }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair touch-none"
                    style={{ height: '150px', opacity: disabled ? 0.6 : 1 }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {!hasSignature && !disabled && (
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ color: colors.textSecondary }}
                    >
                        <span className="text-sm opacity-50">Sign here</span>
                    </div>
                )}
            </div>
        </div>
    )
}
