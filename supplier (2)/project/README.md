# VendorHub - Multi-Vendor E-Commerce Dashboard

A modern, production-ready multi-vendor e-commerce dashboard built with React, TypeScript, and Firebase. Features a beautiful Soft UI design with comprehensive vendor management capabilities.

## 🚀 Features

### Authentication & Authorization
- ✅ Email/password authentication via Firebase Auth
- ✅ Role-based access control (Supplier, Admin, Client)
- ✅ Protected routes and session management
- ✅ Automatic auth state persistence

### Dashboard & Analytics
- 📊 Real-time statistics and KPIs
- 📈 Interactive charts and graphs (Recharts)
- 🎯 Performance metrics and trends
- 📋 Recent orders overview

### Product Management
- 🛍️ Complete CRUD operations for products
- 🏷️ Category-based organization
- 🔍 Advanced search and filtering
- 💰 Pricing with tax calculations
- 📸 Image management
- 🏆 Featured products support
- 💾 Stock quantity tracking

### Order Management
- 📦 Comprehensive order tracking
- 🔄 Status management workflow
- 👥 Customer information display
- 📍 Delivery address management
- 💳 Payment status tracking
- 📱 Responsive order details modal

### UI/UX Design
- 🎨 Modern Soft UI design system
- 📱 Fully responsive layout
- ✨ Smooth animations and transitions
- 🎯 Intuitive navigation
- 🌈 Beautiful gradients and shadows
- 🔧 Consistent component library

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Icons**: Heroicons
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vendorhub-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config to `src/config/config.js`

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Firebase Setup

### 1. Authentication Setup
- Enable Email/Password authentication in Firebase Console
- Configure authorized domains if deploying

### 2. Firestore Database Structure
The application expects the following collections:

```
📁 Fournisseurs (Suppliers)
├── id: string
├── name: string
├── email: string
├── address: string
├── matriculeFiscale: string
├── openingHours: string
├── image: string
├── ownerId: string
└── createdAt: timestamp

📁 products
├── id: string
├── title: string
├── description: string
├── imageURL: string
├── categoryId: string
├── stockQuantity: string
├── isAvailable: boolean
├── discount: string
├── unit: string
├── tva: number
├── prixHTVA: string
├── prixTTC: string
├── feature: boolean
├── FournisseurId: string
├── tags: array
└── createdAt: timestamp

📁 categories
├── id: string
├── title: string
├── description: string
├── image: string
├── FournisseurId: string
└── createdAt: timestamp

📁 subOrders
├── id: string
├── masterOrderId: string
├── fournisseurId: string
├── userId: string
├── userName: string
├── userEmail: string
├── items: array
├── subtotal: number
├── total: number
├── status: string
├── paymentStatus: string
├── deliveryAddress: object
└── createdAt: timestamp

📁 users
├── uid: string
├── email: string
├── fullName: string
├── role: string ('supplier' | 'admin' | 'client')
├── imageUrl: string
├── address: string
└── createdAt: timestamp
```

### 3. Security Rules
Set up Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Suppliers can manage their own products
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.FournisseurId == request.auth.uid);
    }
    
    // Orders are readable by suppliers and admins
    match /subOrders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.fournisseurId == request.auth.uid);
    }
    
    // Categories are readable by all authenticated users
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) to Purple (#8B5CF6) gradients
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale (#F9FAFB to #111827)

### Typography
- **Headings**: Inter font family, bold weights
- **Body**: Inter font family, regular weight
- **Code**: Monospace font family

### Spacing
- Consistent 8px grid system
- Generous padding and margins
- Proper visual hierarchy

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔐 Security Features

- Protected routes with authentication checks
- Role-based access control
- Secure Firebase rules
- Input validation and sanitization
- XSS protection through React

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- Lazy loading of components
- Optimized images and assets
- Efficient Firebase queries
- Minimal bundle size with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review Firebase console for backend issues

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Bulk product import/export
- [ ] Advanced filtering and search
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile app version
- [ ] API integration capabilities

---

Built with ❤️ using React, TypeScript, and Firebase