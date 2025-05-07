
export async function attemptEdgeFunctionUpload(email: string, file: File, dogId?: string | null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email);
  if (dogId) formData.append('dogId', dogId);

  try {
    const response = await fetch('https://hpjlxjfcfyjjpzbsydue.supabase.co/functions/v1/upload-vaccine', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function error: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred');
    }
    
    return {
      success: true,
      data: {
        id: result.filePath,
        path: result.filePath,
        fullPath: result.publicUrl
      }
    };
  } catch (error) {
    console.error('Edge function upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
