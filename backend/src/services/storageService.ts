import { supabase } from '../config/database';

const BUCKET_NAME = 'documents';

/**
 * Upload a PDF buffer to Supabase Storage
 * @param buffer - The PDF buffer
 * @param folder - Folder name (prescriptions or certificates)
 * @param fileName - File name (without extension)
 * @returns Storage path
 */
export async function uploadPDF(buffer: Buffer, folder: 'prescriptions' | 'certificates', fileName: string): Promise<string> {
  const filePath = `${folder}/${fileName}.pdf`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  return filePath;
}

/**
 * Get a signed URL for downloading a PDF
 * @param filePath - Storage path
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedPDFUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) {
    console.error('Signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }

  return data.signedUrl;
}

/**
 * Delete a PDF from storage
 * @param filePath - Storage path
 */
export async function deletePDF(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete PDF: ${error.message}`);
  }
}
