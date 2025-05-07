
import { supabase } from "@/integrations/supabase/client";
import { UploadResult } from "@/types/vaccineUpload";

export const attemptDirectUpload = async (
  filePath: string,
  file: File
): Promise<UploadResult> => {
  try {
    const { data, error } = await supabase.storage
      .from("vaccine_records")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("Direct upload failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        id: data?.id || filePath,
        path: data?.path || filePath,
        fullPath: filePath,
      },
    };
  } catch (uploadError: any) {
    console.error("Exception during direct upload:", uploadError);
    return {
      success: false,
      error: uploadError.message || String(uploadError),
    };
  }
};

export const attemptSignedUrlUpload = async (
  filePath: string,
  file: File
): Promise<UploadResult> => {
  try {
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("vaccine_records")
        .createSignedUploadUrl(filePath);

    if (signedUrlError) {
      console.error("Signed URL creation failed:", signedUrlError);
      return {
        success: false,
        error: signedUrlError.message,
      };
    }

    const { signedUrl, token } = signedUrlData;

    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      console.error("Signed URL upload failed:", uploadResponse.statusText);
      return {
        success: false,
        error: `HTTP error: ${uploadResponse.status} ${uploadResponse.statusText}`,
      };
    }

    console.log("Signed URL upload successful");
    return {
      success: true,
      data: {
        id: token || filePath,
        path: filePath,
        fullPath: filePath,
      },
    };
  } catch (signedUrlError: any) {
    console.error("Exception during signed URL upload:", signedUrlError);
    return {
      success: false,
      error: signedUrlError.message || String(signedUrlError),
    };
  }
};

export const attemptEdgeFunctionUpload = async (
  email: string,
  file: File,
  dogId?: string
): Promise<UploadResult> => {
  try {
    console.log("Attempting upload via edge function...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    
    if (dogId) {
      formData.append("dogId", dogId);
    }

    console.log(
      "FormData created with file:",
      file.name,
      "size:",
      file.size,
      "type:",
      file.type
    );
    console.log("Email added to FormData:", email);
    if (dogId) console.log("Dog ID added to FormData:", dogId);

    const { data, error } = await supabase.functions.invoke("upload-vaccine", {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      return {
        success: false,
        error: error.message || "Edge function error",
      };
    }

    if (!data || !data.success) {
      console.error("Edge function returned unsuccessful result:", data);
      return {
        success: false,
        error: data?.error || "Unknown edge function error",
      };
    }

    console.log("Edge function upload successful:", data);
    return {
      success: true,
      data: {
        id: data.filePath,
        path: data.filePath,
        fullPath: data.filePath,
      },
    };
  } catch (edgeFunctionError: any) {
    console.error("Exception during edge function upload:", edgeFunctionError);
    return {
      success: false,
      error: edgeFunctionError.message || String(edgeFunctionError),
    };
  }
};

export const updateAttendeeRecord = async (
  email: string,
  filePath: string
): Promise<void> => {
  // This is now handled by the edge function
  console.log("Attendee record update is handled by edge function");
};
