import React from 'react';

interface TourButtonsProps {
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isLast?: boolean;
  isFirst?: boolean;
  actionPending?: boolean;
}

export const TourButtons: React.FC<TourButtonsProps> = ({
  onNext,
  onBack,
  onSkip,
  isLast,
  isFirst,
  actionPending = false
}) => {
  return (
    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
      <button
        onClick={onSkip}
        className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2"
      >
        Pular
      </button>

      <div className="flex gap-2">
        {!isFirst && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-pink-600 font-semibold hover:bg-pink-50 rounded-lg transition-colors"
          >
            Voltar
          </button>
        )}
        <button
          onClick={actionPending ? undefined : onNext}
          disabled={actionPending}
          className={`px-6 py-2 text-sm font-bold rounded-lg shadow-sm transition-all ${actionPending
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 text-white transform hover:scale-105'
            }`}
        >
          {isLast ? 'Concluir! 🎉' : 'Próximo'}
        </button>
      </div>
    </div>
  );
};