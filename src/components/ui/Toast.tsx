import React from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  type?: ToastType;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private createToast(message: string, type: ToastType) {
    const toast = document.createElement('div');
    toast.className = `
      px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
      ${type === 'success' ? 'bg-green-500' : ''}
      ${type === 'error' ? 'bg-red-500' : ''}
      ${type === 'info' ? 'bg-blue-500' : ''}
      ${type === 'warning' ? 'bg-yellow-500' : ''}
      text-white text-sm font-medium
    `;
    toast.textContent = message;
    return toast;
  }

  show(message: string, options: ToastOptions = {}) {
    const { duration = 3000, type = 'info' } = options;
    const container = this.createContainer();
    const toast = this.createToast(message, type);
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    // Remove after duration
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        container.removeChild(toast);
        if (container.childNodes.length === 0) {
          document.body.removeChild(container);
          this.container = null;
        }
      }, 300);
    }, duration);
  }

  success(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'error' });
  }

  info(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'info' });
  }

  warning(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'warning' });
  }
}

export const toast = new ToastManager();