import React, { useState, useEffect } from 'react';
import { X, MapPin, Save, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function DeliveryAddressModal({ isOpen, onClose, onSave }: DeliveryAddressModalProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    street: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Tunisie',
    instructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.deliveryAddress) {
      setFormData(state.deliveryAddress);
    }
  }, [state.deliveryAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.user) {
      setError('Vous devez être connecté pour enregistrer une adresse.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userService.saveDeliveryAddress(state.user.id, formData);
      dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: formData });
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement de l'adresse.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      street: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Tunisie',
      instructions: '',
    });
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Adresse de livraison
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="123 Rue Principale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complément d'adresse
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Appartement, étage, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tunis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gouvernorat
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Sélectionnez un gouvernorat</option>
                  {[
                    'Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba','Kairouan','Kasserine','Kébili','Kef','Mahdia','Manouba','Médenine','Monastir','Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis','Zaghouan','Bizerte Sud','Ben Arous Sud','Grand Tunis','Cap Bon'
                  ].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="75001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Tunisie">Tunisie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions de livraison (optionnel)
              </label>
              <textarea
                rows={3}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Sonnez à la porte, laissez devant, etc."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Effacer
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
