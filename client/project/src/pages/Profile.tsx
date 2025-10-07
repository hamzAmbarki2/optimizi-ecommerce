import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, DeliveryAddress } from '../types';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import DeliveryAddressModal from '../components/DeliveryAddressModal';
import { User as UserIcon, Phone, Mail, Save, KeyRound, MapPin } from 'lucide-react';

export default function Profile() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<Pick<User, 'fullName' | 'phone' | 'imageUrl'>>({ fullName: '', phone: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isAddrOpen, setIsAddrOpen] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated || !state.user) {
      dispatch({ type: 'SET_REDIRECT_PATH', payload: '/profile' });
      navigate('/signin');
      return;
    }
    setForm({ fullName: state.user.fullName, phone: state.user.phone, imageUrl: state.user.imageUrl });
  }, [state.isAuthenticated, state.user, navigate, dispatch]);

  const handleBasicSave = async () => {
    if (!state.user) return;
    setSaving(true); setError(null); setMsg(null);
    try {
      await userService.updateUserProfile(state.user.id, {
        fullName: form.fullName,
        phone: form.phone,
        imageUrl: form.imageUrl
      });
      dispatch({ type: 'SET_USER', payload: { ...state.user, fullName: form.fullName, phone: form.phone, imageUrl: form.imageUrl } as User });
      setMsg('Profil mis à jour.');
    } catch (e: any) {
      setError(e.message || 'Échec de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!state.user) return;
    if (!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm) {
      setError('Veuillez saisir des mots de passe valides.');
      return;
    }
    setPwSaving(true); setError(null); setMsg(null);
    try {
      await authService.changePassword(state.user.email, pwForm.current, pwForm.next);
      setMsg('Mot de passe modifié.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e: any) {
      setError(e.message || 'Échec du changement de mot de passe');
    } finally {
      setPwSaving(false);
    }
  };

  if (!state.user) return null;

  const addr = state.deliveryAddress as DeliveryAddress | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center"><UserIcon className="w-5 h-5 mr-2 text-primary-500" />Mon profil</h1>
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">{error}</div>}
          {msg && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300">{msg}</div>}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"><Phone className="w-4 h-4 mr-1" />Téléphone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"><Mail className="w-4 h-4 mr-1" />Email</label>
                <input value={state.user.email} disabled className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300" />
              </div>
              <div className="flex justify-end">
                <button onClick={handleBasicSave} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4" />Enregistrer</button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar (URL)</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <div className="mt-3">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="avatar" className="w-24 h-24 rounded-xl object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">Aperçu</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center"><KeyRound className="w-5 h-5 mr-2 text-primary-500" />Sécurité</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input type="password" placeholder="Mot de passe actuel" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="password" placeholder="Nouveau mot de passe" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="password" placeholder="Confirmer" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleChangePassword} disabled={pwSaving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Changer le mot de passe</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary-500" />Adresse de livraison</h2>
          {addr ? (
            <div className="text-gray-700 dark:text-gray-300">
              <p>{addr.street}{addr.address2 ? `, ${addr.address2}` : ''}</p>
              <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
              <p>{addr.country}</p>
              {addr.instructions && <p className="text-sm text-gray-500 mt-1">Instructions: {addr.instructions}</p>}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Aucune adresse enregistrée.</p>
          )}
          <div className="flex justify-end mt-4">
            <button onClick={() => setIsAddrOpen(true)} className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Gérer l'adresse</button>
          </div>
        </div>

        <DeliveryAddressModal isOpen={isAddrOpen} onClose={() => setIsAddrOpen(false)} onSave={() => { setMsg('Adresse mise à jour.'); }} />
      </div>
    </div>
  );
}

