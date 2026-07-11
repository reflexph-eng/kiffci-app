/**
 * lib/storage.ts
 * Upload d'images vers Firebase Storage.
 */
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export type UploadFolder =
  | 'experiences'
  | 'establishments'
  | 'events'
  | 'avatars'
  | 'cms/homepage'
  | 'cms/banners'
  | 'cms/campaigns'
  | 'cms/categories';

export async function uploadImage(
  folder: UploadFolder,
  entityId: string,
  file: File
): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const storageRef = ref(storage, `${folder}/${entityId}/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadCMSImage(
  folder: 'cms/homepage' | 'cms/banners' | 'cms/campaigns' | 'cms/categories',
  file: File
): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadExperienceImage(experienceId: string, file: File): Promise<string> {
  return uploadImage('experiences', experienceId, file);
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // silencieux si le fichier n'existe pas
  }
}

// ── CMS image upload ──────────────────────────────────────────────────────────
export type CmsFolder = 'cms/homepage' | 'cms/banners' | 'cms/campaigns' | 'cms/categories';

export async function uploadCmsImage(folder: CmsFolder, file: File): Promise<string> {
  const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const { storage } = await import('./firebase');
  const ext      = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const r = storageRef(storage, `${folder}/${filename}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}


export function validateAvatarFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Choisis une image JPG, PNG ou WebP.';
  if (file.size > 3 * 1024 * 1024) return 'La photo ne doit pas dépasser 3 Mo.';
  return null;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const validationError = validateAvatarFile(file);
  if (validationError) throw new Error(validationError);
  return uploadImage('avatars', userId, file);
}
