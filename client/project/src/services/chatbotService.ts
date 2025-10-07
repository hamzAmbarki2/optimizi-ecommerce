interface ChatContext {
  user?: any;
  cartItems: number;
  isAuthenticated: boolean;
  recentlyViewed: number;
}

interface ChatResponse {
  text: string;
  suggestions?: string[];
}

export const chatbotService = {
  async getResponse(message: string, context: ChatContext): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (this.matchesKeywords(lowerMessage, ['bonjour', 'salut', 'hello', 'hi', 'bonsoir'])) {
      const greetings = [
        `Bonjour${context.user ? ` ${context.user.fullName}` : ''} ! 👋 Je suis votre assistant virtuel Optimizi. Comment puis-je vous aider aujourd'hui ?`,
        `Salut${context.user ? ` ${context.user.fullName}` : ''} ! Je suis là pour vous assister. Que puis-je faire pour vous ?`,
        `Bonsoir${context.user ? ` ${context.user.fullName}` : ''} ! Ravi de vous voir. En quoi puis-je vous aider ?`
      ];
      return this.getRandomResponse(greetings);
    }

    // Products and catalog related questions
    if (this.matchesKeywords(lowerMessage, ['produits', 'catalogue', 'articles', 'acheter', 'shopping'])) {
      return "🛍️ Nous avons une grande variété de produits de qualité ! Vous pouvez parcourir notre catalogue complet en visitant la section 'Produits' ou 'Catégories'. Nous proposons des articles pour tous les goûts et tous les budgets. Y a-t-il un type de produit qui vous intéresse particulièrement ?";
    }

    // Delivery related questions
    if (this.matchesKeywords(lowerMessage, ['livraison', 'délai', 'temps', 'combien de temps', 'quand', 'rapidité'])) {
      return "🚚 Nos livraisons sont généralement effectuées en 24-48 heures selon votre localisation et la disponibilité des produits. Nous nous efforçons d'être aussi rapides que possible tout en maintenant la qualité de nos services. Vous recevrez des notifications en temps réel sur le statut de votre commande !";
    }

    // Payment related questions
    if (this.matchesKeywords(lowerMessage, ['paiement', 'payer', 'carte', 'espèces', 'prix', 'coût'])) {
      return "💳 Nous acceptons actuellement le paiement à la livraison en espèces. Nos prix sont très compétitifs et nous offrons souvent des promotions spéciales. La livraison est gratuite pour les commandes de plus de 50TND !";
    }

    // Account related questions
    if (this.matchesKeywords(lowerMessage, ['compte', 'inscription', 'connexion', 'profil', 'mot de passe'])) {
      if (!context.isAuthenticated) {
        return "👤 Pour profiter pleinement d'Optimizi, je vous recommande de créer un compte. Cela vous permettra de suivre vos commandes, sauvegarder vos adresses de livraison, et accéder à des offres exclusives. L'inscription est rapide et gratuite !";
      } else {
        return "✅ Vous êtes déjà connecté ! Vous pouvez gérer votre profil, consulter vos commandes précédentes, et modifier vos informations dans la section 'Mon compte'.";
      }
    }

    // Cart related questions
    if (this.matchesKeywords(lowerMessage, ['panier', 'commande', 'commander', 'acheter'])) {
      if (context.cartItems === 0) {
        return "🛒 Votre panier est actuellement vide. Parcourez notre catalogue et ajoutez vos produits préférés ! Une fois que vous aurez ajouté des articles, vous pourrez finaliser votre commande en quelques clics.";
      } else {
        return `🛒 Vous avez ${context.cartItems} article${context.cartItems > 1 ? 's' : ''} dans votre panier. Vous pouvez consulter votre panier pour modifier les quantités ou procéder au checkout quand vous êtes prêt !`;
      }
    }

    // Promotions and discounts
    if (this.matchesKeywords(lowerMessage, ['promotion', 'réduction', 'offre', 'code promo', 'discount', 'solde'])) {
      return "🎉 Nous avons régulièrement des promotions spéciales ! Actuellement, vous pouvez utiliser les codes : SAVE10 (10% de réduction), WELCOME20 (20% pour les nouveaux clients), FIRST15 (15% sur votre première commande). Consultez aussi nos produits en vedette pour des offres exclusives !";
    }

    // Contact and support
    if (this.matchesKeywords(lowerMessage, ['contact', 'aide', 'support', 'problème', 'réclamation', 'téléphone'])) {
      return "📞 Notre équipe support est là pour vous aider ! Vous pouvez nous contacter par téléphone au +1 (555) 123-4567 (Lun-Ven 9h-18h) ou par email à support@optimizi.com. Pour les questions urgentes concernant une commande en cours, n'hésitez pas à nous appeler directement.";
    }

    // Company information
    if (this.matchesKeywords(lowerMessage, ['entreprise', 'société', 'optimizi', 'qui êtes-vous'])) {
      return "🏢 Optimizi est votre plateforme e-commerce de confiance ! Nous nous spécialisons dans l'optimisation de l'expérience d'achat en ligne. Notre mission est de vous offrir les meilleurs produits avec un service client exceptionnel et une livraison rapide.";
    }

    // Order tracking
    if (this.matchesKeywords(lowerMessage, ['suivi', 'où est', 'statut', 'tracking', 'commande en cours'])) {
      return "📱 Vous pouvez suivre votre commande en temps réel ! Une fois votre commande confirmée, vous recevrez des notifications à chaque étape : préparation, expédition, et livraison. Consultez la section 'Mes commandes' pour voir le statut détaillé de toutes vos commandes.";
    }

    // Cancellation and refunds
    if (this.matchesKeywords(lowerMessage, ['annuler', 'remboursement', 'retour', 'problème commande'])) {
      return "🔄 Vous pouvez annuler votre commande gratuitement tant qu'elle n'a pas été expédiée. Pour les remboursements ou les problèmes avec votre commande, contactez-nous immédiatement et nous trouverons une solution rapide. Votre satisfaction est notre priorité !";
    }

    // App features
    if (this.matchesKeywords(lowerMessage, ['application', 'app', 'fonctionnalité', 'comment utiliser'])) {
      return "📱 Notre plateforme Optimizi est conçue pour être simple et intuitive ! Vous pouvez parcourir les catégories, rechercher des produits spécifiques, ajouter des favoris à votre liste de souhaits, et passer commande en quelques clics. Toutes vos informations sont sauvegardées pour faciliter vos prochaines commandes.";
    }

    // Feedback and reviews
    if (this.matchesKeywords(lowerMessage, ['avis', 'note', 'évaluation', 'commentaire', 'feedback'])) {
      return "⭐ Vos avis sont très importants pour nous ! Après chaque commande, vous pouvez noter et commenter les produits que vous avez reçus. Cela aide les autres clients à faire leur choix et nous permet d'améliorer continuellement notre service.";
    }

    // Hours and availability
    if (this.matchesKeywords(lowerMessage, ['horaire', 'ouvert', 'fermé', 'disponible', 'heure'])) {
      return "🕐 Notre plateforme est disponible 24h/24 et 7j/7 pour vos achats en ligne ! Notre service client est disponible du lundi au vendredi de 9h à 18h. Les commandes passées avant 16h sont généralement traitées le jour même.";
    }

    // Thank you responses
    if (this.matchesKeywords(lowerMessage, ['merci', 'thanks', 'parfait', 'super', 'génial'])) {
      const thankYouResponses = [
        "De rien ! 😊 Je suis ravi d'avoir pu vous aider. N'hésitez pas si vous avez d'autres questions !",
        "Avec plaisir ! 🙌 C'est toujours un plaisir d'aider nos clients. Bon shopping !",
        "Je vous en prie ! 😄 Si vous avez besoin d'autre chose, je suis là !"
      ];
      return this.getRandomResponse(thankYouResponses);
    }

    // Goodbye responses
    if (this.matchesKeywords(lowerMessage, ['au revoir', 'bye', 'à bientôt', 'salut', 'ciao'])) {
      const goodbyeResponses = [
        "Au revoir ! 👋 Merci d'avoir choisi Optimizi. À très bientôt !",
        "À bientôt ! 😊 N'hésitez pas à revenir si vous avez des questions. Bon shopping !",
        "Bonne journée ! 🌟 Merci pour votre visite et à très bientôt sur Optimizi !"
      ];
      return this.getRandomResponse(goodbyeResponses);
    }

    // Default response for unrecognized queries
    const defaultResponses = [
      "Je ne suis pas sûr de comprendre votre question. 🤔 Pouvez-vous me donner plus de détails ? Je peux vous aider avec les commandes, la livraison, les paiements, ou toute autre question sur Optimizi !",
      "Hmm, je n'ai pas bien saisi. 😅 Pouvez-vous reformuler votre question ? Je suis là pour vous aider avec tout ce qui concerne Optimizi !",
      "Je ne trouve pas d'information spécifique à votre demande. 🔍 Pouvez-vous être plus précis ? Ou contactez notre support au +1 (555) 123-4567 pour une aide personnalisée !"
    ];

    return this.getRandomResponse(defaultResponses);
  },

  matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  },

  getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // Get suggested quick replies based on context
  getSuggestions(context: ChatContext): string[] {
    const suggestions = [
      "Voir le catalogue",
      "Temps de livraison",
      "Codes promo",
      "Contacter le support"
    ];

    if (!context.isAuthenticated) {
      suggestions.unshift("Créer un compte");
    }

    if (context.cartItems === 0) {
      suggestions.unshift("Parcourir les produits");
    } else {
      suggestions.unshift("Voir mon panier");
    }

    return suggestions;
  }
};