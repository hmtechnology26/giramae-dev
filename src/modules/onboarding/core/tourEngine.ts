import Shepherd from 'shepherd.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GiraTooltip } from '../components/GiraTooltip';
import type { TourConfig } from '../types';

declare global {
  interface Window {
    Shepherd: any;
  }
}

const isMobile = () => window.innerWidth < 640;

const getMobilePosition = (originalPosition: string | undefined): string => {
  if (!isMobile()) return originalPosition || 'bottom';
  if (originalPosition === 'top') return 'bottom';
  if (originalPosition === 'left' || originalPosition === 'right') return 'bottom';
  return originalPosition || 'bottom';
};

export class TourEngine {
  private tourInstance: any;

  constructor() {
    this.tourInstance = null;
  }

  start(config: TourConfig, onComplete: () => void, onCancel: () => void) {
    if (this.tourInstance) {
      this.tourInstance.cancel();
    }

    this.tourInstance = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'gira-tour-element',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: false },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
        popperOptions: {
          strategy: 'fixed', // Necessário para posicionar relativo à viewport, ignorando transforms/scrolls
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 12]
              }
            },
            {
              name: 'preventOverflow',
              options: {
                padding: 8,
                boundary: 'viewport' // Garante que tooltip não saia da tela
              }
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['bottom', 'top', 'left', 'right']
              }
            }
          ]
        }
      }
    });

    config.steps.forEach((step, index) => {
      const isCentered = !step.attachTo;
      const requiresAction = step.requiresAction === true && step.actionTarget;

      const attachTo = step.attachTo ? {
        element: step.attachTo.element,
        on: getMobilePosition(step.attachTo.on),
      } : undefined;

      // Classes customizadas
      const stepClasses = isCentered
        ? 'gira-tour-element gira-tour-centered'
        : 'gira-tour-element';

      this.tourInstance.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: attachTo,
        classes: stepClasses,
        highlightClass: step.highlightClass || 'gira-highlight',
        beforeShowPromise: step.beforeShow ? () => Promise.resolve(step.beforeShow!()) : undefined,
        buttons: [],
        when: {
          show: () => {
            const currentStepElement = this.tourInstance.getCurrentStep().el;
            const contentElement = currentStepElement.querySelector('.shepherd-content');

            if (isCentered) {
              currentStepElement.classList.add('gira-tour-centered');
            }

            // Estado para controlar actionPending
            let actionPending = requiresAction;
            let actionListener: ((e: Event) => void) | null = null;

            // Função para re-renderizar com novo estado
            const renderTooltip = () => {
              if (!contentElement) return;

              contentElement.innerHTML = '';
              const container = document.createElement('div');
              contentElement.appendChild(container);

              const root = ReactDOM.createRoot(container);
              root.render(
                React.createElement(GiraTooltip, {
                  title: step.title,
                  text: step.text,
                  emotion: step.giraEmotion,
                  currentStep: index + 1,
                  totalSteps: config.steps.length,
                  onNext: () => this.tourInstance.next(),
                  onBack: () => this.tourInstance.back(),
                  onSkip: () => this.tourInstance.cancel(),
                  isCentered: isCentered,
                  actionPending: actionPending,
                })
              );
            };

            // Render inicial
            renderTooltip();

            // Configurar listener de ação se necessário
            if (requiresAction && step.actionTarget) {
              const targetElement = document.querySelector(step.actionTarget);

              if (targetElement) {
                actionListener = (e: Event) => {
                  // Remover listener
                  if (actionListener) {
                    targetElement.removeEventListener('click', actionListener);
                  }

                  // Atualizar estado e re-renderizar
                  actionPending = false;
                  renderTooltip();

                  //  Avançar após pequeno delay para feedback visual
                  setTimeout(() => {
                    this.tourInstance.next();
                  }, 300);
                };

                targetElement.addEventListener('click', actionListener);

                // Limpar listener se tour for cancelado
                const cleanupListener = () => {
                  if (actionListener && targetElement) {
                    targetElement.removeEventListener('click', actionListener);
                  }
                };

                this.tourInstance.once('cancel', cleanupListener);
                this.tourInstance.once('complete', cleanupListener);
              } else {
                console.warn(`[Tour] Action target not found: ${step.actionTarget}. Falling back to normal navigation.`);
                // Fallback: se elemento não existe, desabilita requiresAction
                actionPending = false;
                renderTooltip();
              }
            }
          }
        }
      });
    });

    this.tourInstance.on('complete', () => {
      onComplete();
    });

    this.tourInstance.on('cancel', () => {
      onCancel();
    });

    this.tourInstance.start();
  }

  stop() {
    if (this.tourInstance) {
      this.tourInstance.cancel();
    }
  }
}

export const tourEngine = new TourEngine();
