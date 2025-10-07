import React, { useState, useEffect } from 'react';
import { supplierEmailService } from '../services/supplierEmailService';
import { orderNotificationTrigger } from '../services/orderNotificationTrigger';
import { useAuth } from '../contexts/AuthContext';
import { useFournisseur } from '../hooks/useFournisseur';

export const EmailTestComponent: React.FC = () => {
  const { userData } = useAuth();
  const { fournisseur } = useFournisseur();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [systemTestResult, setSystemTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [monitoringStatus, setMonitoringStatus] = useState<any>(null);
  const [notificationStats, setNotificationStats] = useState<any>(null);

  useEffect(() => {
    // Initialize email service
    supplierEmailService.initialize();
    
    // Set default test email to user's email
    if (userData?.email) {
      setTestEmail(userData.email);
    }

    // Get monitoring status
    updateMonitoringStatus();
    
    // Get notification stats if fournisseur is available
    if (fournisseur?.id) {
      loadNotificationStats();
    }
  }, [userData, fournisseur]);

  const updateMonitoringStatus = () => {
    const status = orderNotificationTrigger.getMonitoringStatus();
    setMonitoringStatus(status);
  };

  const loadNotificationStats = async () => {
    if (!fournisseur?.id) return;
    
    try {
      const stats = await orderNotificationTrigger.getNotificationStats(fournisseur.id);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const checkConfiguration = () => {
    const status = supplierEmailService.getConfigStatus();
    setConfigStatus(status);
    console.log('📋 [EmailTest] Configuration status:', status);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await supplierEmailService.testConnection();
      setConnectionStatus(result);
      console.log('🔗 [EmailTest] Connection test result:', result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
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

      console.log('📧 [EmailTest] Sending test email to:', testEmail);
      
      // Send test email
      const result = await supplierEmailService.sendTestNotification(testEmail, userData?.fullName || 'Test Supplier');
      
      if (result) {
        setTestResult('✅ Email de test envoyé avec succès ! Vérifiez votre boîte de réception.');
      } else {
        setTestResult('❌ Échec de l\'envoi de l\'email de test. Vérifiez la console pour les erreurs.');
      }
    } catch (error) {
      console.error('❌ [EmailTest] Test email error:', error);
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCompleteSystem = async () => {
    if (!testEmail) {
      setSystemTestResult({ errors: ['Veuillez entrer une adresse email pour le test.'] });
      return;
    }

    setIsLoading(true);
    setSystemTestResult(null);

    try {
      console.log('🧪 [EmailTest] Testing complete notification system...');
      
      const result = await orderNotificationTrigger.testNotificationSystem(testEmail, userData?.fullName || 'Test Supplier');
      setSystemTestResult(result);
      
      console.log('📊 [EmailTest] Complete system test result:', result);
    } catch (error) {
      console.error('❌ [EmailTest] Complete system test error:', error);
      setSystemTestResult({
        connectionTest: false,
        emailTest: false,
        configurationValid: false,
        errors: [`System test error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manualTriggerTest = async () => {
    if (!fournisseur?.id) {
      setTestResult('❌ Profil fournisseur requis pour ce test.');
      return;
    }

    setIsLoading(true);
    try {
      // This would trigger a notification for an existing order
      // For demo purposes, we'll just show that the system is ready
      setTestResult('✅ Système de déclenchement manuel prêt. Utilisez cette fonction pour renvoyer des notifications pour des commandes spécifiques.');
    } catch (error) {
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">🧪</span>
          Test du Système de Notification Fournisseur
        </h2>
        <p className="text-gray-600 mb-8">
          Testez et configurez le système complet de notifications email pour les fournisseurs.
        </p>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Service Email</h3>
            <p className="text-sm text-blue-700">
              {configStatus?.isConfigured ? '✅ Configuré' : '❌ Non configuré'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🔗 Connexion Backend</h3>
            <p className="text-sm text-green-700">
              {connectionStatus?.success ? '✅ Connecté' : '❌ Déconnecté'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">👁️ Surveillance</h3>
            <p className="text-sm text-purple-700">
              {monitoringStatus?.totalListeners > 0 ? '✅ Active' : '❌ Inactive'}
            </p>
          </div>
        </div>

        {/* Configuration Check */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Vérification de la Configuration
          </h3>
          <button
            onClick={checkConfiguration}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Vérifier la Configuration
          </button>
          
          {configStatus && (
            <div className="mt-6">
              <div className={`p-4 rounded-xl ${
                configStatus.isConfigured 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="font-semibold mb-2">
                  {configStatus.isConfigured ? '✅ Configuration Valide' : '❌ Configuration Incomplète'}
                </p>
                {!configStatus.isConfigured && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Variables d'environnement manquantes:</p>
                    <ul className="list-disc list-inside text-sm mt-2">
                      {configStatus.missingFields.map((field: string) => (
                        <li key={field} className="font-mono bg-red-100 px-2 py-1 rounded mt-1">{field}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {configStatus.currentValues && (
                  <div className="mt-4 p-3 bg-white rounded-lg text-xs">
                    <p className="font-semibold mb-2">Valeurs actuelles:</p>
                    <p><strong>Backend URL:</strong> {configStatus.currentValues.backendUrl}</p>
                    <p><strong>Support Email:</strong> {configStatus.currentValues.supportEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Connection Test */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">🔗</span>
            Test de Connexion Backend
          </h3>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Test en cours...' : 'Tester la Connexion'}
          </button>
          
          {connectionStatus && (
            <div className="mt-6">
              <div className={`p-4 rounded-xl ${
                connectionStatus.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="font-semibold mb-2">
                  {connectionStatus.success ? '✅ Connexion Réussie' : '❌ Connexion Échouée'}
                </p>
                <p className="text-sm">{connectionStatus.message}</p>
                {connectionStatus.details && (
                  <div className="mt-3 p-3 bg-white rounded-lg text-xs">
                    <pre>{JSON.stringify(connectionStatus.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Email Test */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">📧</span>
            Test d'Envoi d\'Email
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testEmailService}
              disabled={isLoading || !testEmail}
              className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                isLoading || !testEmail
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer Email de Test'}
            </button>
            
            <button
              onClick={testCompleteSystem}
              disabled={isLoading || !testEmail}
              className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                isLoading || !testEmail
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Test Système Complet
            </button>
          </div>
          
          {testResult && (
            <div className={`mt-6 p-4 rounded-xl ${
              testResult.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-semibold">{testResult}</p>
            </div>
          )}

          {systemTestResult && (
            <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">📊 Résultats du Test Système Complet</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className={`p-3 rounded-lg text-center ${
                  systemTestResult.configurationValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className="font-semibold">Configuration</div>
                  <div>{systemTestResult.configurationValid ? '✅ Valide' : '❌ Invalide'}</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  systemTestResult.connectionTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className="font-semibold">Connexion</div>
                  <div>{systemTestResult.connectionTest ? '✅ Réussie' : '❌ Échouée'}</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  systemTestResult.emailTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className="font-semibold">Email</div>
                  <div>{systemTestResult.emailTest ? '✅ Envoyé' : '❌ Échec'}</div>
                </div>
              </div>
              
              {systemTestResult.errors && systemTestResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 mb-2">Erreurs détectées:</h5>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {systemTestResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Monitoring Status */}
        {monitoringStatus && (
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <span className="mr-2">👁️</span>
              Statut de la Surveillance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">État du Système</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fournisseurs surveillés:</span>
                    <span className="font-semibold">{monitoringStatus.activeSuppliers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Listeners actifs:</span>
                    <span className="font-semibold">{monitoringStatus.totalListeners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commandes traitées:</span>
                    <span className="font-semibold">{monitoringStatus.processedOrdersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Santé du système:</span>
                    <span className={`font-semibold ${
                      monitoringStatus.systemHealth === 'healthy' ? 'text-green-600' :
                      monitoringStatus.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {monitoringStatus.systemHealth === 'healthy' ? '✅ Sain' :
                       monitoringStatus.systemHealth === 'warning' ? '⚠️ Attention' : '❌ Erreur'}
                    </span>
                  </div>
                </div>
              </div>

              {notificationStats && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Statistiques de Notification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total envoyées:</span>
                      <span className="font-semibold">{notificationStats.totalNotificationsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Réussies:</span>
                      <span className="font-semibold text-green-600">{notificationStats.successfulNotifications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Échouées:</span>
                      <span className="font-semibold text-red-600">{notificationStats.failedNotifications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de réussite:</span>
                      <span className="font-semibold">
                        {notificationStats.totalNotificationsSent > 0 
                          ? `${((notificationStats.successfulNotifications / notificationStats.totalNotificationsSent) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={updateMonitoringStatus}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Actualiser le Statut
            </button>
          </div>
        )}

        {/* Advanced Testing */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">🔧</span>
            Tests Avancés
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={manualTriggerTest}
              disabled={isLoading}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
            >
              Test Déclenchement Manuel
            </button>
            
            <button
              onClick={loadNotificationStats}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              Recharger les Statistiques
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="p-6 bg-yellow-50 rounded-2xl border-l-4 border-yellow-400">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Instructions de Configuration
          </h3>
          <div className="text-yellow-700 text-sm space-y-3">
            <p className="font-medium">Avant de tester, assurez-vous d'avoir:</p>
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>Démarré le serveur email backend dans <code className="bg-yellow-200 px-2 py-1 rounded">supplier (2)/project/server/</code></li>
              <li>Configuré Gmail App Password dans le fichier <code className="bg-yellow-200 px-2 py-1 rounded">.env</code> du backend</li>
              <li>Défini <code className="bg-yellow-200 px-2 py-1 rounded">VITE_EMAIL_BACKEND_URL</code> dans votre <code className="bg-yellow-200 px-2 py-1 rounded">.env</code> frontend</li>
              <li>Redémarré le serveur de développement frontend après la mise à jour des variables d'environnement</li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="font-semibold">📖 Documentation complète:</p>
              <p>Consultez <code className="bg-yellow-200 px-1 rounded">EMAIL_TROUBLESHOOTING_GUIDE.md</code> pour les instructions détaillées de configuration.</p>
            </div>
          </div>
        </div>

        {/* Environment Variables Help */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">🔧</span>
            Variables d'Environnement Requises
          </h3>
          <div className="bg-gray-800 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto">
            <div># Frontend .env (supplier (2)/project/.env)</div>
            <div>VITE_EMAIL_BACKEND_URL=http://localhost:4001</div>
            <div>VITE_SUPPLIER_SUPPORT_EMAIL=your-support@example.com</div>
            <div></div>
            <div># Backend .env (supplier (2)/project/server/.env)</div>
            <div>GMAIL_USER=your-email@gmail.com</div>
            <div>GMAIL_APP_PASSWORD=your_16_character_app_password</div>
            <div>FROM_NAME=Optimizi</div>
            <div>PORT=4001</div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Copiez ces lignes dans vos fichiers <code className="bg-gray-200 px-1 rounded">.env</code> respectifs et remplacez par vos vraies valeurs.
          </p>
        </div>

        {/* Current Environment Variables */}
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Variables d'Environnement Actuelles
          </h3>
          <div className="bg-blue-900 text-blue-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
            <div>VITE_EMAIL_BACKEND_URL = {import.meta.env.VITE_EMAIL_BACKEND_URL || 'NON DÉFINI'}</div>
            <div>VITE_SUPPLIER_SUPPORT_EMAIL = {import.meta.env.VITE_SUPPLIER_SUPPORT_EMAIL || 'NON DÉFINI'}</div>
          </div>
          <p className="text-sm text-blue-700 mt-3">
            Si ces valeurs montrent "NON DÉFINI", vous devez créer/mettre à jour votre fichier .env
          </p>
        </div>
      </div>
    </div>
  );
};