import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFocusTrap, useAnnouncer } from '../../hooks/useAccessibility';

export interface AccessibleDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Function to close the dialog
   */
  onClose: () => void;
  
  /**
   * Dialog title
   */
  title: string;
  
  /**
   * Dialog content
   */
  children: React.ReactNode;
  
  /**
   * Dialog actions (buttons)
   */
  actions?: React.ReactNode;
  
  /**
   * Whether to show the close button in the title
   */
  showCloseButton?: boolean;
  
  /**
   * Additional props for the Dialog component
   */
  dialogProps?: Omit<React.ComponentProps<typeof Dialog>, 'open' | 'onClose'>;
  
  /**
   * ID for the dialog
   */
  id?: string;
  
  /**
   * Whether to announce the dialog opening to screen readers
   */
  announceOnOpen?: boolean;
  
  /**
   * Custom announcement message when dialog opens
   */
  openAnnouncement?: string;
  
  /**
   * Maximum width of the dialog
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  
  /**
   * Whether the dialog is full width
   */
  fullWidth?: boolean;
}

/**
 * AccessibleDialog component
 * 
 * An accessible dialog component that follows best practices for accessibility:
 * - Traps focus within the dialog
 * - Provides proper ARIA attributes
 * - Handles keyboard navigation
 * - Announces dialog opening to screen readers
 * - Restores focus when closed
 */
const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  showCloseButton = true,
  dialogProps,
  id = 'accessible-dialog',
  announceOnOpen = true,
  openAnnouncement,
  maxWidth = 'sm',
  fullWidth = true
}) => {
  // Generate unique IDs for dialog parts
  const titleId = `${id}-title`;
  const contentId = `${id}-content`;
  
  // Use focus trap hook
  const { containerRef, activate, deactivate } = useFocusTrap();
  
  // Use announcer hook
  const { announcePolite } = useAnnouncer();
  
  // Initial focus element ref
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  
  // Activate focus trap when dialog opens
  useEffect(() => {
    if (open) {
      // Activate focus trap
      activate();
      
      // Announce dialog opening
      if (announceOnOpen) {
        announcePolite(openAnnouncement || `Dialog opened: ${title}`);
      }
    } else {
      // Deactivate focus trap
      deactivate();
    }
    
    // Clean up on unmount
    return () => {
      deactivate();
    };
  }, [open, activate, deactivate, announceOnOpen, openAnnouncement, title, announcePolite]);
  
  // Handle escape key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={contentId}
      ref={containerRef as React.RefObject<HTMLDivElement>}
      onKeyDown={handleKeyDown}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...dialogProps}
    >
      <DialogTitle id={titleId}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          
          {showCloseButton && (
            <IconButton
              aria-label="Close dialog"
              onClick={onClose}
              edge="end"
              ref={initialFocusRef}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent id={contentId} dividers>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AccessibleDialog;