import React from 'react';
import { EmailTestComponent } from '../components/EmailTestComponent';

const EmailTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test du Système Email</h1>
          <p className="text-gray-600">Testez et configurez le système d'email pour les notifications fournisseur</p>
        </div>
        
        <EmailTestComponent />
      </div>
    </div>
  );
};

export default EmailTest;