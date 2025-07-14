import { supabase } from '@/integrations/supabase/client';
import type { ProcessingLog } from '@/hooks/useProcessingLogs';

export interface DownloadResult {
  success: boolean;
  error?: string;
}

/**
 * Downloads a file associated with a processing log entry.
 * Fetches file details from purchase_file table and downloads from Supabase Storage.
 */
export async function downloadProcessingLogFile(
  log: ProcessingLog
): Promise<DownloadResult> {
  try {

    console.log('Starting download for log:', log.id);
    
    // Step 1: Fetch the file record from purchase_file table
    const { data: fileRecord, error: fileQueryError } = await supabase
      .from('purchase_file')
      .select('file_path, file_name')
      .eq('processing_logs_id', log.id)
      .maybeSingle();

    console.log('Purchase file query result:', { fileRecord, fileQueryError });

    if (fileQueryError) {
      console.error('Error querying purchase_file:', fileQueryError);
      return {
        success: false,
        error: 'Oh no, something unexpected happened! Please try again or reach out to support.'
      };
    }

    // Step 2: Check if file record exists
    if (!fileRecord) {
      return {
        success: false,
        error: 'Oops! No file is associated with this log entry. Please check and try again.'
      };
    }

    // Step 3: Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(fileRecord.file_name);

    if (downloadError) {
      console.error('Error downloading from storage:', downloadError);
      
      // Check if it's a file not found error
      if (downloadError.message?.includes('not found') || downloadError.message?.includes('404')) {
        return {
          success: false,
          error: 'Sorry, the file seems to be missing from storage. Contact support if this persists!'
        };
      }

      return {
        success: false,
        error: 'Something went wrong while downloading the file. Please try again later!'
      };
    }

    if (!fileData) {
      return {
        success: false,
        error: 'Sorry, the file seems to be missing from storage. Contact support if this persists!'
      };
    }

    // Step 4: Trigger browser download
    const url = URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileRecord.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };

  } catch (error) {
    console.error('Unexpected error during file download:', error);
    return {
      success: false,
      error: 'Oh no, something unexpected happened! Please try again or reach out to support.'
    };
  }
}