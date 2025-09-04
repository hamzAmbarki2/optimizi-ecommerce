import React, { useState } from 'react';
import { supplierEmailService } from '../services/supplierEmailService';
import { useAuth } from '../contexts/AuthContext';

export const EmailTestComponent: React.FC = () => {
  const { userData } = useAuth();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const checkConfiguration = () => {
    const status = supplierEmailService.getConfigStatus();
    setConfigStatus(status);
    console.log('Configuration status:', status);
  };

  const testEmailService = async () => {
    if (!testEmail) {
      setTestResult('❌ Veuillez entrer une adresse email pour le test.');
      return;
    }

    setIsLoading(true);
    setTestResult('');

    try {
      // Initialize the service
      supplierEmailService.initialize();

      // Check if configured
      const configStatus = supplierEmailService.getConfigStatus();
      if (!configStatus.isConfigured) {
        setTestResult(`❌ Service email non configuré. Variables manquantes: ${configStatus.missingFields.join(', ')}`);
        return;
      }

      console.log('Sending test email to:', testEmail);
      
      // Send test email
      const result = await supplierEmailService.sendTestEmail(testEmail, userData?.fullName || 'Test Supplier');
      
      if (result) {
        setTestResult('✅ Email de test envoyé avec succès ! Vérifiez votre boîte de réception.');
      } else {
        setTestResult('❌ Échec de l\'envoi de l\'email de test. Vérifiez la console pour les erreurs.');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🧪 Test du Service Email Fournisseur
      </h2>

      {/* Configuration Check */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          📋 Statut de la Configuration
        </h3>
        <button
          onClick={checkConfiguration}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Vérifier la Configuration
        </button>
        
        {configStatus && (
          <div className="mt-4">
            <div className={`p-3 rounded-lg ${
              configStatus.isConfigured 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">
                {configStatus.isConfigured ? '✅ Configuré' : '❌ Non Configuré'}
              </p>
              {!configStatus.isConfigured && (
                <div className="mt-2">
                  <p className="text-sm">Variables d'environnement manquantes:</p>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {configStatus.missingFields.map((field: string) => (
                      <li key={field} className="font-mono">{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configStatus.currentValues && (
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                  <p><strong>Service ID:</strong> {configStatus.currentValues.serviceId}</p>
                  <p><strong>Template ID:</strong> {configStatus.currentValues.templateId}</p>
                  <p><strong>Public Key:</strong> {configStatus.currentValues.publicKey}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Test Email Sending */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          📧 Test d'Envoi d'Email
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email de test (où vous voulez recevoir l'email)
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="votre-email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={testEmailService}
          disabled={isLoading || !testEmail}
          className={`px-4 py-2 rounded transition-colors ${
            isLoading || !testEmail
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer Email de Test'}
        </button>
        
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg ${
            testResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <p className="font-semibold">{testResult}</p>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          ⚠️ Configuration Requise
        </h3>
        <div className="text-yellow-700 text-sm space-y-2">
          <p>Avant de tester, assurez-vous d'avoir:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>Run the new supplier email backend in <code className="font-mono">server/</code> (see <code className="font-mono">server/README.md</code>)</li>
            <li>Create a Gmail App Password and add it to the backend <code className="bg-yellow-200 px-1 rounded">.env</code></li>
            <li>Set <code className="bg-yellow-200 px-1 rounded">VITE_EMAIL_BACKEND_URL</code> in your frontend <code className="bg-yellow-200 px-1 rounded">.env</code> to point to the backend (e.g. <code className="font-mono">http://localhost:4001</code>)</li>
            <li>Restart the frontend dev server after updating environment variables</li>
          </ol>
          <p className="mt-3">
            📖 Voir <code className="bg-yellow-200 px-1 rounded">SUPPLIER_EMAIL_SETUP.md</code> pour les instructions détaillées.
          </p>
        </div>
      </div>

      {/* Environment Variables Help */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          🔧 Variables d'Environnement Requises
        </h3>
          <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
          <div>VITE_EMAIL_BACKEND_URL=http://localhost:4001</div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Copiez ces lignes dans votre fichier <code className="bg-gray-200 px-1 rounded">.env</code> et remplacez par vos vraies valeurs.
        </p>
      </div>

      {/* Current Environment Variables */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-3">
          🔍 Variables d'Environnement Actuelles
        </h3>
        <div className="bg-blue-800 text-blue-100 p-4 rounded font-mono text-sm overflow-x-auto">
          <div>VITE_EMAIL_BACKEND_URL = {import.meta.env.VITE_EMAIL_BACKEND_URL || 'NON DÉFINI'}</div>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Si ces valeurs montrent "NON DÉFINI", vous devez créer/mettre à jour votre fichier .env
        </p>
      </div>
    </div>
  );
};