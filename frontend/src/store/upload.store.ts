import { postWithAuth } from '@/service/httpService';

interface UploadState {
  file: FormData | null;
  setFile: (file: FormData) => void;
  upload: () => Promise<void>;
}

export const uploadStore: UploadState = {
  file: null,

  setFile(file) {
    uploadStore.file = file;
  },

  async upload() {
    if (!uploadStore.file) {
      console.warn('No file to upload');
      return;
    }
    await postWithAuth('/upload', uploadStore.file);
  },
};
