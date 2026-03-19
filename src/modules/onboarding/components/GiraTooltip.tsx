import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GiraAvatar } from './GiraAvatar';
import { TourButtons } from './TourButtons';
import type { GiraEmotion } from '../types';
import { GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiraTooltipProps {
  title: string;
  text: string;
  emotion: GiraEmotion;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isCentered?: boolean;
  actionPending?: boolean; // Nova prop para indicar que usuário precisa executar ação
}

export const GiraTooltip: React.FC<GiraTooltipProps> = ({
  title,
  text,
  emotion,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  isCentered = false,
  actionPending = false,
}) => {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [currentStep]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    // Não permitir drag quando centralizado
    if (isCentered) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }, [offset, isCentered]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isCentered) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    setOffset({
      x: dragStartRef.current.offsetX + deltaX,
      y: dragStartRef.current.offsetY + deltaY,
    });
  }, [isDragging, isCentered]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCentered) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCentered) return;
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-2xl max-w-sm relative overflow-hidden select-none shadow-2xl",
        isCentered && "min-w-[300px] sm:min-w-[340px]"
      )}
      style={{
        transform: isCentered ? 'none' : `translate(${offset.x}px, ${offset.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      {/* Drag handle - esconder quando centralizado */}
      {!isCentered && (
        <div
          className="absolute top-0 left-0 w-full h-8 bg-pink-500/90 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none rounded-t-2xl"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <GripHorizontal className="w-5 h-5 text-white/70" />
        </div>
      )}

      <div className={cn(
        "flex gap-3 sm:gap-4 items-start",
        !isCentered && "pt-6"
      )}>
        <div className="flex-shrink-0">
          <GiraAvatar emotion={emotion} size={isCentered ? "md" : "sm"} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-bold text-gray-800 mb-1 leading-tight",
            isCentered ? "text-lg sm:text-xl" : "text-base sm:text-lg"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-gray-600 leading-relaxed",
            isCentered ? "text-sm sm:text-base" : "text-xs sm:text-sm"
          )}>
            {text}
          </p>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
        <span>Passo {currentStep} de {totalSteps}</span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full",
                isCentered ? "h-2 w-2" : "h-1.5 w-1.5",
                i + 1 <= currentStep ? 'bg-pink-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Mensagem de ação pendente */}
      {actionPending && (
        <div className="mt-2 p-2 bg-pink-50 rounded-lg border border-pink-200">
          <p className="text-xs text-pink-700 flex items-center gap-1">
            <span className="animate-pulse">●</span>
            Clique no elemento destacado para continuar
          </p>
        </div>
      )}

      <TourButtons
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
        isFirst={isFirst}
        isLast={isLast}
        actionPending={actionPending}
      />
    </div>
  );
};
