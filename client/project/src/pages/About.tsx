import React from 'react';
import { Users, Award, Clock, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Héro */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            À propos d'<span className="text-primary-500">Optimizi</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nous sommes passionnés par l'optimisation de votre expérience d'achat en ligne, en rendant le e-commerce plus accessible, rapide et agréable pour tous.
          </p>
        </div>

        {/* Section Histoire */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Notre histoire</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Fondée en 2020, Optimizi a commencé avec une mission simple : révolutionner l'expérience d'achat en ligne en la rendant plus intuitive, plus rapide et plus personnalisée. Ce qui a débuté comme une petite startup est devenu une plateforme de confiance desservant des milliers de clients chaque jour.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Nous croyons que le shopping en ligne devrait être une expérience agréable et sans friction. Notre technologie avancée aide à connecter les clients avec les produits qu'ils recherchent, tout en soutenant les entreprises locales et en créant des emplois dans notre communauté.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Notre équipe"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Section Valeurs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">Nos valeurs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                title: 'Efficacité',
                description: 'Livraison rapide et expérience utilisateur optimisée',
                color: 'from-blue-400 to-blue-500'
              },
              {
                icon: Heart,
                title: 'Qualité',
                description: 'Seulement les meilleurs produits et services de qualité',
                color: 'from-red-400 to-red-500'
              },
              {
                icon: Users,
                title: 'Communauté',
                description: 'Soutenir les entreprises locales et créer des liens',
                color: 'from-green-400 to-green-500'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'Améliorer continuellement notre plateforme et service',
                color: 'from-primary-400 to-primary-500'
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Chiffres */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">En chiffres</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-300">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">200+</div>
              <div className="text-gray-600 dark:text-gray-300">Produits disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">1M+</div>
              <div className="text-gray-600 dark:text-gray-300">Commandes traitées</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">15</div>
              <div className="text-gray-600 dark:text-gray-300">Villes desservies</div>
            </div>
          </div>
        </div>

        {/* Section Équipe */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Rencontrez notre équipe</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Les personnes passionnées derrière Optimizi qui travaillent sans relâche pour vous offrir la meilleure expérience d'achat en ligne.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'PDG & Fondatrice',
                image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300'
              },
              {
                name: 'Mike Chen',
                role: 'Responsable Technologie',
                image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Responsable des opérations',
                image: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=300'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{member.name}</h3>
                <p className="text-primary-500 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}