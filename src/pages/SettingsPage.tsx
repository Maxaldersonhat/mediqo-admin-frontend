import { useEffect, useState, type FormEvent } from 'react';
import { fetchMe, changePassword, uploadAvatar, type AuthUser } from '../services/authService';

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const loadUser = () => {
    setLoading(true);
    fetchMe()
      .then((res) => setUser(res.user))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load your details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleAvatarPick = async (file: File | null) => {
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
      setAvatarVersion(Date.now());
      loadUser();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      return setPasswordError('Please fill in both password fields');
    }
    if (newPassword.length < 8) {
      return setPasswordError('New password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return setPasswordError('New passwords do not match');
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = user?.avatarUrl ? `${import.meta.env.VITE_API_URL}${user.avatarUrl}?v=${avatarVersion}` : null;

  return (
    <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Manage your pharmacy account preferences.</p>
      </div>

      <section className="mb-6 rounded-2xl border border-blue-50 bg-white p-6 shadow-sm shadow-blue-100/50 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Staff Profile</h2>

        {loading ? (
          <p className="text-sm text-blue-500 animate-pulse">Loading profile data…</p>
        ) : loadError ? (
          <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg">{loadError}</p>
        ) : (
          <div className="flex items-center gap-6">
            <label
              htmlFor="avatar-input"
              className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-blue-50 text-blue-500 transition-colors ${
                avatarUploading ? 'cursor-wait border-blue-200' : 'cursor-pointer border-blue-300 hover:border-blue-500 hover:bg-blue-100'
              } dark:bg-gray-900 dark:border-gray-600 dark:text-gray-400`}
            >
              {avatarUploading ? (
                <span className="text-xs font-semibold">Uploading…</span>
              ) : avatarSrc ? (
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold">Upload Photo</span>
              )}
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarUploading}
                onChange={(e) => handleAvatarPick(e.target.files?.[0] ?? null)}
              />
            </label>

            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              {avatarError && <p className="mt-2 text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">{avatarError}</p>}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-50 bg-white p-6 shadow-sm shadow-blue-100/50 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Security</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white transition-all" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white transition-all" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white transition-all" 
            />
          </div>

          {passwordError && <p className="text-sm font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm font-medium text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100">Password updated successfully.</p>}

          <div className="pt-2">
            <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]">
              {saving ? 'Saving changes…' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}