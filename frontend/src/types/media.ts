// Defines the structure for a Media Item
export interface MediaItemData {
  id: string;
  url: string; // URL to the full-size media
  thumbnailUrl?: string; // Optional: URL to a thumbnail version (especially for images)
  fileName: string;
  altText?: string; // Alt text for images
  caption?: string;
  mimeType: string; // e.g., 'image/jpeg', 'application/pdf', 'video/mp4'
  size: number; // In bytes
  width?: number; // For images/videos
  height?: number; // For images/videos
  uploadedAt: string; // ISO date string
  uploadedBy?: string; // User ID or name
  // Potentially other metadata like folderId, tags, etc.
}

// For form data when uploading or editing media item details (some fields might be auto-generated)
export type MediaItemFormData = Omit<
  MediaItemData,
  | 'id'
  | 'url'
  | 'thumbnailUrl'
  | 'uploadedAt'
  | 'uploadedBy'
  | 'size'
  | 'mimeType'
  | 'width'
  | 'height'
> & {
  file?: File; // For new uploads
  // Allow updating altText, caption, fileName
  altText?: string;
  caption?: string;
  fileName?: string; // If allowing rename
};