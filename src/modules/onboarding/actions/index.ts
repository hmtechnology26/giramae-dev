export const expandFilters = async () => {
  // Simulating an action that interacts with the UI
  const btn = document.querySelector('[data-tour="expand-filters"]') as HTMLButtonElement;
  if (btn) {
    btn.click();
    return new Promise((resolve) => setTimeout(resolve, 300)); // Wait for animation
  }
};

export const waitForElement = (selector: string): Promise<Element> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector)!);
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector)!);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
};