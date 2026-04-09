/**
 * Accessibility Service
 * 
 * This service provides utilities and helpers for improving accessibility
 * throughout the application. It includes functions for managing focus,
 * handling keyboard navigation, and providing screen reader announcements.
 */

// Focus management
class FocusManager {
  private static lastFocusedElement: HTMLElement | null = null;
  private static focusableSelector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
  
  /**
   * Save the currently focused element
   */
  public static saveFocus(): void {
    this.lastFocusedElement = document.activeElement as HTMLElement;
  }
  
  /**
   * Restore focus to the last focused element
   */
  public static restoreFocus(): void {
    if (this.lastFocusedElement && this.lastFocusedElement.focus) {
      this.lastFocusedElement.focus();
    }
  }
  
  /**
   * Trap focus within a container
   * @param container The container to trap focus within
   * @param initialFocusElement Optional element to focus initially
   * @returns A function to remove the focus trap
   */
  public static trapFocus(container: HTMLElement, initialFocusElement?: HTMLElement): () => void {
    // Get all focusable elements
    const focusableElements = Array.from(
      container.querySelectorAll(this.focusableSelector)
    ) as HTMLElement[];
    
    // If no focusable elements, return empty function
    if (focusableElements.length === 0) {
      return () => {};
    }
    
    // Focus the initial element or the first focusable element
    const elementToFocus = initialFocusElement || focusableElements[0];
    elementToFocus.focus();
    
    // Handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Tab key
      if (event.key !== 'Tab') {
        return;
      }
      
      // Get first and last focusable elements
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      
      // If Shift+Tab on first element, move to last element
      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
      // If Tab on last element, move to first element
      else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };
    
    // Add event listener
    container.addEventListener('keydown', handleKeyDown);
    
    // Return function to remove focus trap
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

// Screen reader announcements
class Announcer {
  private static instance: Announcer;
  private liveRegion: HTMLElement | null = null;
  private politeRegion: HTMLElement | null = null;
  
  private constructor() {
    this.createLiveRegions();
  }
  
  /**
   * Get the Announcer instance
   */
  public static getInstance(): Announcer {
    if (!Announcer.instance) {
      Announcer.instance = new Announcer();
    }
    
    return Announcer.instance;
  }
  
  /**
   * Create the live regions for screen reader announcements
   */
  private createLiveRegions(): void {
    // Create assertive live region
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'assertive');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('role', 'alert');
    this.liveRegion.className = 'sr-only';
    
    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    
    // Add to document
    document.body.appendChild(this.liveRegion);
    document.body.appendChild(this.politeRegion);
    
    // Add style for sr-only class if it doesn't exist
    if (!document.getElementById('sr-only-style')) {
      const style = document.createElement('style');
      style.id = 'sr-only-style';
      style.textContent = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Announce a message to screen readers (assertive)
   * @param message The message to announce
   */
  public announce(message: string): void {
    if (!this.liveRegion) {
      this.createLiveRegions();
    }
    
    // Clear the live region
    if (this.liveRegion) {
      this.liveRegion.textContent = '';
      
      // Force a reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.liveRegion.offsetHeight;
      
      // Set the message
      this.liveRegion.textContent = message;
    }
  }
  
  /**
   * Announce a message to screen readers (polite)
   * @param message The message to announce
   */
  public announcePolite(message: string): void {
    if (!this.politeRegion) {
      this.createLiveRegions();
    }
    
    // Clear the live region
    if (this.politeRegion) {
      this.politeRegion.textContent = '';
      
      // Force a reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.politeRegion.offsetHeight;
      
      // Set the message
      this.politeRegion.textContent = message;
    }
  }
  
  /**
   * Clean up the live regions
   */
  public cleanup(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }
    
    if (this.politeRegion && this.politeRegion.parentNode) {
      this.politeRegion.parentNode.removeChild(this.politeRegion);
    }
    
    this.liveRegion = null;
    this.politeRegion = null;
  }
}

// Keyboard navigation
class KeyboardNavigation {
  /**
   * Create a keyboard navigation for a list of items
   * @param container The container element
   * @param itemSelector The selector for the items
   * @param options Options for the keyboard navigation
   * @returns A function to remove the keyboard navigation
   */
  public static createListNavigation(
    container: HTMLElement,
    itemSelector: string,
    options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      loop?: boolean;
      activateOnFocus?: boolean;
      onSelect?: (element: HTMLElement) => void;
    } = {}
  ): () => void {
    const {
      orientation = 'vertical',
      loop = true,
      activateOnFocus = false,
      onSelect
    } = options;
    
    // Handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get all items
      const items = Array.from(
        container.querySelectorAll(itemSelector)
      ) as HTMLElement[];
      
      // If no items, return
      if (items.length === 0) {
        return;
      }
      
      // Get the currently focused item
      const currentIndex = items.findIndex(item => item === document.activeElement);
      
      // Handle arrow keys
      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            this.focusNextItem(items, currentIndex, loop);
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            this.focusPreviousItem(items, currentIndex, loop);
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            this.focusNextItem(items, currentIndex, loop);
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            this.focusPreviousItem(items, currentIndex, loop);
          }
          break;
        case 'Home':
          event.preventDefault();
          this.focusFirstItem(items);
          break;
        case 'End':
          event.preventDefault();
          this.focusLastItem(items);
          break;
        case 'Enter':
        case ' ':
          if (currentIndex !== -1 && onSelect) {
            event.preventDefault();
            onSelect(items[currentIndex]);
          }
          break;
      }
    };
    
    // Handle focus events
    const handleFocus = (event: FocusEvent) => {
      if (!activateOnFocus || !onSelect) {
        return;
      }
      
      const target = event.target as HTMLElement;
      if (target.matches(itemSelector)) {
        onSelect(target);
      }
    };
    
    // Add event listeners
    container.addEventListener('keydown', handleKeyDown);
    
    if (activateOnFocus) {
      container.addEventListener('focus', handleFocus, true);
    }
    
    // Return function to remove event listeners
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      if (activateOnFocus) {
        container.removeEventListener('focus', handleFocus, true);
      }
    };
  }
  
  /**
   * Focus the next item in a list
   * @param items The list of items
   * @param currentIndex The current index
   * @param loop Whether to loop around
   */
  private static focusNextItem(items: HTMLElement[], currentIndex: number, loop: boolean): void {
    if (currentIndex === -1) {
      // If no item is focused, focus the first item
      this.focusFirstItem(items);
    } else if (currentIndex < items.length - 1) {
      // Focus the next item
      items[currentIndex + 1].focus();
    } else if (loop) {
      // Loop to the first item
      this.focusFirstItem(items);
    }
  }
  
  /**
   * Focus the previous item in a list
   * @param items The list of items
   * @param currentIndex The current index
   * @param loop Whether to loop around
   */
  private static focusPreviousItem(items: HTMLElement[], currentIndex: number, loop: boolean): void {
    if (currentIndex === -1) {
      // If no item is focused, focus the last item
      this.focusLastItem(items);
    } else if (currentIndex > 0) {
      // Focus the previous item
      items[currentIndex - 1].focus();
    } else if (loop) {
      // Loop to the last item
      this.focusLastItem(items);
    }
  }
  
  /**
   * Focus the first item in a list
   * @param items The list of items
   */
  private static focusFirstItem(items: HTMLElement[]): void {
    if (items.length > 0) {
      items[0].focus();
    }
  }
  
  /**
   * Focus the last item in a list
   * @param items The list of items
   */
  private static focusLastItem(items: HTMLElement[]): void {
    if (items.length > 0) {
      items[items.length - 1].focus();
    }
  }
}

// Accessibility service
class AccessibilityService {
  public static FocusManager = FocusManager;
  public static Announcer = Announcer;
  public static KeyboardNavigation = KeyboardNavigation;
  
  private static instance: AccessibilityService;
  private announcer: Announcer;
  
  private constructor() {
    this.announcer = Announcer.getInstance();
  }
  
  /**
   * Get the AccessibilityService instance
   */
  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    
    return AccessibilityService.instance;
  }
  
  /**
   * Announce a message to screen readers (assertive)
   * @param message The message to announce
   */
  public announce(message: string): void {
    this.announcer.announce(message);
  }
  
  /**
   * Announce a message to screen readers (polite)
   * @param message The message to announce
   */
  public announcePolite(message: string): void {
    this.announcer.announcePolite(message);
  }
  
  /**
   * Save the currently focused element
   */
  public saveFocus(): void {
    FocusManager.saveFocus();
  }
  
  /**
   * Restore focus to the last focused element
   */
  public restoreFocus(): void {
    FocusManager.restoreFocus();
  }
  
  /**
   * Trap focus within a container
   * @param container The container to trap focus within
   * @param initialFocusElement Optional element to focus initially
   * @returns A function to remove the focus trap
   */
  public trapFocus(container: HTMLElement, initialFocusElement?: HTMLElement): () => void {
    return FocusManager.trapFocus(container, initialFocusElement);
  }
  
  /**
   * Create a keyboard navigation for a list of items
   * @param container The container element
   * @param itemSelector The selector for the items
   * @param options Options for the keyboard navigation
   * @returns A function to remove the keyboard navigation
   */
  public createListNavigation(
    container: HTMLElement,
    itemSelector: string,
    options?: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      loop?: boolean;
      activateOnFocus?: boolean;
      onSelect?: (element: HTMLElement) => void;
    }
  ): () => void {
    return KeyboardNavigation.createListNavigation(container, itemSelector, options);
  }
  
  /**
   * Clean up the accessibility service
   */
  public cleanup(): void {
    this.announcer.cleanup();
  }
}

// Create and export a singleton instance
const accessibilityService = AccessibilityService.getInstance();
export default accessibilityService;

// Export classes for direct use
export { FocusManager, Announcer, KeyboardNavigation };