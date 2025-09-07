import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { emailService } from '../services/emailService';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Initialize email service if not already done
      emailService.initialize();

      // Check if EmailJS is configured
      if (!emailService.isConfigured()) {
        throw new Error('Le service d\'email n\'est pas configuré. Veuillez contacter l\'administrateur.');
      }

      // Send the contact form email
      const success = await emailService.sendContactFormEmail(formData);

      if (success) {
        setStatus('success');
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Échec de l\'envoi du message. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Contactez-<span className="text-primary-500">nous</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Nous serions ravis d'avoir de vos nouvelles. Contactez notre équipe Optimizi.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Contactez-nous</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Vous avez une question, une suggestion ou besoin d'aide avec votre commande ? Nous sommes là pour vous aider ! 
                Contactez-nous via l'un des canaux ci-dessous, et nous vous répondrons dès que possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Email</h3>
                  <p className="text-gray-600 dark:text-gray-300">support@optimizi.com</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nous répondrons dans les 24 heures</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Téléphone</h3>
                  <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lun-Ven 9h-18h EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Bureau</h3>
                  <p className="text-gray-600 dark:text-gray-300">123 Rue du Commerce<br />District Technologique, TC 12345</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Horaires d'ouverture</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Lundi - Vendredi : 9h00 - 18h00<br />
                    Samedi : 10h00 - 16h00<br />
                    Dimanche : Fermé
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Envoyez-nous un message</h2>
            
            {/* Status Messages */}
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Message envoyé avec succès !</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-300">Erreur lors de l'envoi</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* EmailJS Configuration Warning */}
            {!emailService.isConfigured() && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Configuration requise</h4>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Le service d'email n'est pas encore configuré. Veuillez configurer EmailJS pour activer cette fonctionnalité.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Entrez votre nom complet"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Entrez votre email"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="De quoi s'agit-il ?"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Racontez-nous davantage sur votre demande..."
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !emailService.isConfigured()}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer le message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Section FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            Questions fréquemment posées
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "Combien de temps prend la livraison ?",
                answer: "La plupart des commandes sont livrées en 24 à 48 heures, selon votre emplacement et la disponibilité du produit."
              },
              {
                question: "Quels sont les frais de livraison ?",
                answer: "Les frais de livraison varient selon la distance et le poids, généralement entre 3 et 8 TND. Livraison gratuite pour les commandes dépassant 50 TND."
              },
              {
                question: "Puis-je suivre ma commande ?",
                answer: "Oui ! Une fois votre commande confirmée, vous recevrez des mises à jour par email et pourrez suivre le statut de votre livraison."
              },
              {
                question: "Que faire si je ne suis pas satisfait de ma commande ?",
                answer: "Nous voulons que vous soyez totalement satisfait. Contactez notre équipe de support dans les 30 jours, et nous travaillerons à résoudre tout problème."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}