import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, CreditCard, Upload, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    cin: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (state.isAuthenticated && !state.authLoading) {
      const redirectPath = state.redirectPath || '/';
      dispatch({ type: 'SET_REDIRECT_PATH', payload: null });
      navigate(redirectPath);
    }
  }, [state.isAuthenticated, state.authLoading, state.redirectPath, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authService.signUp(formData);
      dispatch({ type: 'SET_USER', payload: user });
      
      // Rediriger vers la page prévue ou l'accueil
      const redirectPath = state.redirectPath || '/';
      dispatch({ type: 'SET_REDIRECT_PATH', payload: null });
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  if (state.authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un compte client</h1>
            <p className="text-gray-600">Rejoignez Optimizi en tant que client et commencez à commander</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez votre nom complet"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez votre e-mail"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Créez un mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez votre numéro de téléphone"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CIN (Carte d'identité nationale)
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez votre CIN"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image de profil (Optionnel)
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez l'URL de l'image"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <User className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Compte Client</h4>
                  <p className="text-sm text-blue-700">
                    Vous créez un compte client qui vous donnera accès à l'interface d'achat d'Optimizi. 
                    Vous pourrez parcourir les produits, passer des commandes et suivre vos livraisons.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-600">
                J'accepte les{' '}
                <Link to="/terms" className="text-orange-500 hover:text-orange-600">
                  Conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
                  Politique de confidentialité
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Création du compte client...
                </>
              ) : (
                'Créer un compte client'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Vous avez déjà un compte client ?{' '}
              <Link to="/signin" className="text-orange-500 hover:text-orange-600 font-medium">
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}