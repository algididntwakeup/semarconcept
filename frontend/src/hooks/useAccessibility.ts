import { useRef, useEffect, useCallback } from 'react';
import accessibilityService from '../services/accessibility.service';

/**
 * Hook for managing focus trap within a container
 * 
 * @param initialFocusRef Optional ref to the element that should receive focus when the trap is activated
 * @returns An object with a ref to attach to the container and functions to activate/deactivate the focus trap
 */
export function useFocusTrap(initialFocusRef?: React.RefObject<HTMLElement>) {
  const containerRef = useRef<HTMLElement>(null);
  const removeTrapRef = useRef<(() => void) | null>(null);
  
  // Activate the focus trap
  const activate = useCallback(() => {
    if (containerRef.current) {
      // Save current focus
      accessibilityService.saveFocus();
      
      // Trap focus within the container
      removeTrapRef.current = accessibilityService.trapFocus(
        containerRef.current,
        initialFocusRef?.current || undefined
      );
    }
  }, [initialFocusRef]);
  
  // Deactivate the focus trap
  const deactivate = useCallback(() => {
    if (removeTrapRef.current) {
      // Remove the focus trap
      removeTrapRef.current();
      removeTrapRef.current = null;
      
      // Restore focus
      accessibilityService.restoreFocus();
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (removeTrapRef.current) {
        removeTrapRef.current();
      }
    };
  }, []);
  
  return { containerRef, activate, deactivate };
}

/**
 * Hook for creating keyboard navigation for a list of items
 * 
 * @param itemSelector The selector for the items
 * @param options Options for the keyboard navigation
 * @returns An object with a ref to attach to the container
 */
export function useKeyboardNavigation(
  itemSelector: string,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    activateOnFocus?: boolean;
    onSelect?: (element: HTMLElement) => void;
  } = {}
) {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    
    // Create keyboard navigation
    const removeNavigation = accessibilityService.createListNavigation(
      containerRef.current,
      itemSelector,
      options
    );
    
    // Clean up on unmount
    return () => {
      removeNavigation();
    };
  }, [itemSelector, options]);
  
  return { containerRef };
}

/**
 * Hook for announcing messages to screen readers
 * 
 * @returns Functions to announce messages
 */
export function useAnnouncer() {
  // Announce a message (assertive)
  const announce = useCallback((message: string) => {
    accessibilityService.announce(message);
  }, []);
  
  // Announce a message (polite)
  const announcePolite = useCallback((message: string) => {
    accessibilityService.announcePolite(message);
  }, []);
  
  return { announce, announcePolite };
}

/**
 * Hook for managing skip links
 * 
 * @param links Array of skip links with id and label
 * @returns JSX for the skip links
 */
export function useSkipLinks(links: Array<{ id: string; label: string }>) {
  // Focus the target element when a skip link is clicked
  const handleSkipLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const href = event.currentTarget.getAttribute('href');
    if (!href) return;
    
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Make the element focusable if it isn't already
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
      
      // Focus the element
      targetElement.focus();
      
      // Announce that we've skipped to the content
      accessibilityService.announcePolite(`Skipped to ${targetElement.getAttribute('aria-label') || targetId}`);
    }
  }, []);
  
  // Return props and handlers for skip links
  return {
    links,
    handleSkipLinkClick,
    skipLinkStyles: {
      container: {
        position: 'absolute',
        top: '-1000px',
        left: 0,
        zIndex: 9999
      },
      link: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '10px 15px',
        background: '#000',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 'bold',
        transform: 'translateY(-100%)',
        transition: 'transform 0.3s'
      },
      linkFocus: {
        transform: 'translateY(0)',
        outline: '2px solid #fff'
      }
    }
  };
}

/**
 * Hook for managing ARIA attributes
 * 
 * @returns Functions to create ARIA attributes
 */
export function useAria() {
  // Create attributes for a button that controls a popup
  const createButtonProps = useCallback((controlsId: string, expanded: boolean) => {
    return {
      'aria-controls': controlsId,
      'aria-expanded': expanded,
      'aria-haspopup': true
    };
  }, []);
  
  // Create attributes for a popup
  const createPopupProps = useCallback((id: string, labelledBy?: string) => {
    return {
      id,
      role: 'dialog',
      'aria-modal': true,
      ...(labelledBy ? { 'aria-labelledby': labelledBy } : {})
    };
  }, []);
  
  // Create attributes for a tab
  const createTabProps = useCallback((id: string, panelId: string, selected: boolean) => {
    return {
      id,
      role: 'tab',
      'aria-controls': panelId,
      'aria-selected': selected,
      tabIndex: selected ? 0 : -1
    };
  }, []);
  
  // Create attributes for a tab panel
  const createTabPanelProps = useCallback((id: string, tabId: string) => {
    return {
      id,
      role: 'tabpanel',
      'aria-labelledby': tabId,
      tabIndex: 0
    };
  }, []);
  
  // Create attributes for a menu button
  const createMenuButtonProps = useCallback((menuId: string, expanded: boolean) => {
    return {
      'aria-controls': menuId,
      'aria-expanded': expanded,
      'aria-haspopup': 'menu'
    };
  }, []);
  
  // Create attributes for a menu
  const createMenuProps = useCallback((id: string, labelledBy: string) => {
    return {
      id,
      role: 'menu',
      'aria-labelledby': labelledBy
    };
  }, []);
  
  // Create attributes for a menu item
  const createMenuItemProps = useCallback((disabled: boolean = false) => {
    return {
      role: 'menuitem',
      tabIndex: -1,
      ...(disabled ? { 'aria-disabled': true } : {})
    };
  }, []);
  
  return {
    createButtonProps,
    createPopupProps,
    createTabProps,
    createTabPanelProps,
    createMenuButtonProps,
    createMenuProps,
    createMenuItemProps
  };
}

/**
 * Hook for managing live regions
 * 
 * @param ariaLive The aria-live value ('polite' or 'assertive')
 * @returns An object with a ref to attach to the live region and a function to update the content
 */
export function useLiveRegion(ariaLive: 'polite' | 'assertive' = 'polite') {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  
  // Set up the live region attributes
  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', ariaLive);
      liveRegionRef.current.setAttribute('aria-atomic', 'true');
      
      if (ariaLive === 'assertive') {
        liveRegionRef.current.setAttribute('role', 'alert');
      }
      
      // Add sr-only class
      liveRegionRef.current.className = 'sr-only';
    }
  }, [ariaLive]);
  
  // Update the live region content
  const updateContent = useCallback((content: string) => {
    if (liveRegionRef.current) {
      // Clear the live region
      liveRegionRef.current.textContent = '';
      
      // Force a reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      liveRegionRef.current.offsetHeight;
      
      // Set the content
      liveRegionRef.current.textContent = content;
    }
  }, []);
  
  // Return the ref and update function
  return { liveRegionRef, updateContent };
}