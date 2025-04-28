
import { supabase } from "@/integrations/supabase/client";
import { UploadResult } from "@/types/vaccineUpload";

export const attemptDirectUpload = async (filePath: string, file: File): Promise<UploadResult> => {
  try {
    const { data, error } = await supabase.storage
      .from('vaccine_records')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });
      
    if (error) {
      console.error("Direct upload failed:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      data: {
        id: data?.id || filePath,
        path: data?.path || filePath,
        fullPath: filePath
      }
    };
  } catch (uploadError: any) {
    console.error("Exception during direct upload:", uploadError);
    return { 
      success: false, 
      error: uploadError.message || String(uploadError) 
    };
  }
};

export const attemptSignedUrlUpload = async (filePath: string, file: File): Promise<UploadResult> => {
  try {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('vaccine_records')
      .createSignedUploadUrl(filePath);
      
    if (signedUrlError) {
      console.error("Signed URL creation failed:", signedUrlError);
      return { 
        success: false, 
        error: signedUrlError.message 
      };
    }
    
    const { signedUrl, token } = signedUrlData;
    
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: file
    });
    
    if (!uploadResponse.ok) {
      console.error("Signed URL upload failed:", uploadResponse.statusText);
      return { 
        success: false, 
        error: `HTTP error: ${uploadResponse.status} ${uploadResponse.statusText}` 
      };
    }
    
    console.log("Signed URL upload successful");
    return { 
      success: true, 
      data: {
        id: token || filePath,
        path: filePath,
        fullPath: filePath
      }
    };
  } catch (signedUrlError: any) {
    console.error("Exception during signed URL upload:", signedUrlError);
    return { 
      success: false, 
      error: signedUrlError.message || String(signedUrlError) 
    };
  }
};

export const attemptEdgeFunctionUpload = async (email: string, file: File): Promise<UploadResult> => {
  try {
    console.log("Attempting upload via edge function...");
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);
    
    const { data, error } = await supabase.functions.invoke(
      "upload-vaccine",
      {
        body: formData,
      }
    );
    
    if (error || !data.success) {
      console.error("Edge function upload failed:", error || data.error);
      return { 
        success: false, 
        error: error?.message || data?.error || "Unknown edge function error" 
      };
    }
    
    console.log("Edge function upload successful:", data);
    return { 
      success: true, 
      data: {
        id: data.filePath,
        path: data.filePath,
        fullPath: data.filePath
      }
    };
  } catch (edgeFunctionError: any) {
    console.error("Exception during edge function upload:", edgeFunctionError);
    return { 
      success: false, 
      error: edgeFunctionError.message || String(edgeFunctionError) 
    };
  }
};

export const updateAttendeeRecord = async (email: string, filePath: string): Promise<void> => {
  const { data: { publicUrl } } = supabase.storage
    .from("vaccine_records")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("attendees")
    .update({
      vaccine_upload_status: true,
      vaccine_file_path: filePath,
      vaccine_file_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  if (updateError) {
    console.error("Database update error:", updateError);
    throw new Error(`Database update failed: ${updateError.message}`);
  }
};
