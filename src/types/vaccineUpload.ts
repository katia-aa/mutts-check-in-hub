
export interface UseVaccineUploadProps {
  email: string | null;
  onUploadSuccess: () => void;
}

export interface UploadSuccess {
  success: true;
  data: {
    id: string;
    path: string;
    fullPath: string;
  };
}

export interface UploadError {
  success: false;
  error: string;
}

export type UploadResult = UploadSuccess | UploadError;

export interface UploadState {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
  uploadProgress: number | null;
  isConfiguringStorage: boolean;
}
