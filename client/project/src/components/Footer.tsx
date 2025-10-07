import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white px-6 py-16 border-t border-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/LogoOptimizi.svg" 
                alt="Optimizi" 
                className="h-8 w-auto filter brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Votre plateforme e-commerce préférée. Découvrez une large gamme de produits de qualité avec une livraison rapide et fiable.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">À propos</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carrières</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Actualités</a></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sécurité</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Réseaux sociaux</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Optimizi. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}