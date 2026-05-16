import React, { useRef, useState } from 'react';
import { X, Trash2, Loader2, Upload, CheckCircle } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { apiClient } from '../../services/apiClient';

interface ProfileImageModalProps {
  user: { name: string; profile_image?: string | null; role?: string };
  onClose: () => void;
  onUpdate: (newImageUrl: string | null) => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({ user, onClose, onUpdate }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // currentImage tracks what's shown in the modal — starts from prop, updates on upload
  const [currentImage, setCurrentImage] = useState<string | null>(user.profile_image || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadDone(false);
    setUploading(true);

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setCurrentImage(objectUrl);

    try {
      const result = await apiClient.updateProfileImage(file);
      // Replace preview with real URL from server
      URL.revokeObjectURL(objectUrl);
      setCurrentImage(result.url);
      onUpdate(result.url);   // update parent immediately
      setUploadDone(true);
    } catch (err: any) {
      URL.revokeObjectURL(objectUrl);
      setCurrentImage(user.profile_image || null); // revert preview on error
      setError(err.message || 'Upload failed. Check that the profile_image column exists in the database (run /run-profile-image-migration.php).');
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await apiClient.deleteProfileImage();
      setCurrentImage(null);
      onUpdate(null);
      setUploadDone(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to remove photo');
    } finally {
      setDeleting(false);
    }
  };

  const hasPhoto = !!currentImage;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Profile Photo</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center py-8 px-6 gap-4">
          <div className="relative">
            <div style={{
              width: 160, height: 160,
              borderRadius: '1.5rem',
              overflow: 'hidden',
              border: '4px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            }}>
              {hasPhoto ? (
                <img
                  src={currentImage!}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <UserAvatar name={user.name} role={user.role} size={160} />
              )}
            </div>

            {/* Spinner overlay while uploading */}
            {(uploading || deleting) && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '1.5rem',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Loader2 size={36} className="text-white animate-spin" />
              </div>
            )}

            {/* Success tick */}
            {uploadDone && !uploading && (
              <div style={{
                position: 'absolute', bottom: -8, right: -8,
                background: '#10b981', borderRadius: '50%',
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid white',
              }}>
                <CheckCircle size={18} color="white" />
              </div>
            )}
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
            {uploadDone
              ? '✅ Photo updated successfully!'
              : hasPhoto
                ? 'Change or remove your profile photo'
                : 'No photo yet — your initial is shown as avatar'}
          </p>

          {error && (
            <div className="text-red-600 text-xs font-semibold text-center bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl w-full border border-red-100">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || deleting}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-careermap-navy text-white rounded-2xl font-bold text-sm hover:bg-[#023058] disabled:opacity-50 transition-all shadow-lg"
          >
            {uploading
              ? <><Loader2 size={18} className="animate-spin" /> Uploading...</>
              : <><Upload size={18} /> {hasPhoto ? 'Change Photo' : 'Upload Photo'}</>
            }
          </button>

          {hasPhoto && !uploading && (
            <button
              onClick={handleDelete}
              disabled={uploading || deleting}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm hover:bg-red-100 disabled:opacity-50 transition-all border border-red-100 dark:border-red-900/30"
            >
              {deleting
                ? <><Loader2 size={18} className="animate-spin" /> Removing...</>
                : <><Trash2 size={18} /> Remove Photo</>
              }
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 dark:text-slate-400 font-semibold text-sm hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {uploadDone ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageModal;
