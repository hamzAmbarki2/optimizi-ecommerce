import React from 'react';
import { EmailTestComponent } from '../components/EmailTestComponent';

const EmailTest: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl mb-6">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Système de Notification Fournisseur
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Testez et configurez le système complet de notifications email automatiques pour les commandes. 
              Ce système envoie des emails détaillés et professionnels à chaque nouvelle commande ou mise à jour de statut.
            </p>
          </div>
        </div>
      </div>
      
      <EmailTestComponent />
      
      {/* Additional Information Section */}
      <div className="mt-12 bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">📋</span>
          Fonctionnalités du Système
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <div className="text-2xl mb-3">🆕</div>
            <h3 className="font-semibold text-blue-800 mb-2">Nouvelles Commandes</h3>
            <p className="text-sm text-blue-700">
              Notifications automatiques instantanées pour chaque nouvelle commande avec tous les détails client et produit.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="font-semibold text-green-800 mb-2">Mises à Jour Statut</h3>
            <p className="text-sm text-green-700">
              Suivi en temps réel des changements de statut avec notifications automatiques pour chaque étape.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="font-semibold text-purple-800 mb-2">Informations Financières</h3>
            <p className="text-sm text-purple-700">
              Récapitulatifs financiers détaillés avec taxes, frais de livraison et totaux calculés automatiquement.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
            <div className="text-2xl mb-3">📍</div>
            <h3 className="font-semibold text-orange-800 mb-2">Détails Livraison</h3>
            <p className="text-sm text-orange-700">
              Adresses complètes avec instructions spéciales et informations de contact pour coordination.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-red-800 mb-2">Actions Prioritaires</h3>
            <p className="text-sm text-red-700">
              Listes d'actions requises avec délais et liens directs vers le tableau de bord pour traitement rapide.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-800 mb-2">Suivi et Analytics</h3>
            <p className="text-sm text-gray-700">
              Statistiques complètes des notifications avec taux de succès et monitoring en temps réel.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailTest;