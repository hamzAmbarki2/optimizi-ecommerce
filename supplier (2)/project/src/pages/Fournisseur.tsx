import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../contexts/AuthContext';
import {
  PencilIcon,
  MapPinIcon,
  ClockIcon,
  IdentificationIcon,
  PhotoIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Fournisseur {
  id: string;
  name: string;
  matriculeFiscale: string;
  address: string;
  openingHours: string;
  image: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

const Fournisseur: React.FC = () => {
  const { userData } = useAuth();
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    matriculeFiscale: '',
    address: '',
    openingHours: '',
    image: ''
  });

  useEffect(() => {
    fetchFournisseur();
  }, [userData]);

  const fetchFournisseur = async () => {
    try {
      setLoading(true);
      if (!userData?.uid) return;

      const fournisseurQuery = query(
        collection(db, 'Fournisseurs'),
        where('ownerId', '==', userData.uid)
      );
      
      const snapshot = await getDocs(fournisseurQuery);
      
      if (!snapshot.empty) {
        const fournisseurData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as Fournisseur;
        
        setFournisseur(fournisseurData);
        setFormData({
          name: fournisseurData.name,
          matriculeFiscale: fournisseurData.matriculeFiscale,
          address: fournisseurData.address,
          openingHours: fournisseurData.openingHours,
          image: fournisseurData.image
        });
      }
    } catch (error) {
      console.error('Error fetching fournisseur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const fournisseurData = {
        ...formData,
        ownerId: userData?.uid,
        updatedAt: new Date().toISOString()
      };

      if (fournisseur) {
        // Update existing
        await updateDoc(doc(db, 'Fournisseurs', fournisseur.id), fournisseurData);
        setFournisseur({ ...fournisseur, ...fournisseurData });
      } else {
        // Create new - only one per user allowed
        const docRef = await addDoc(collection(db, 'Fournisseurs'), {
          ...fournisseurData,
          createdAt: new Date().toISOString()
        });
        
        const newFournisseur = {
          id: docRef.id,
          ...fournisseurData,
          createdAt: new Date().toISOString()
        } as Fournisseur;
        
        setFournisseur(newFournisseur);
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Error saving fournisseur:', error);
    }
  };

  const handleDelete = async () => {
    if (!fournisseur) return;
    
    try {
      setDeleting(true);
      
      // Delete all related data
      // 1. Delete products
      const productsQuery = query(collection(db, 'products'), where('FournisseurId', '==', fournisseur.id));
      const productsSnapshot = await getDocs(productsQuery);
      for (const productDoc of productsSnapshot.docs) {
        await deleteDoc(doc(db, 'products', productDoc.id));
      }
      
      // 2. Delete categories
      const categoriesQuery = query(collection(db, 'categories'), where('FournisseurId', '==', fournisseur.id));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      for (const categoryDoc of categoriesSnapshot.docs) {
        await deleteDoc(doc(db, 'categories', categoryDoc.id));
      }
      
      // 3. Delete sub orders
      const ordersQuery = query(collection(db, 'subOrders'), where('fournisseurId', '==', fournisseur.id));
      const ordersSnapshot = await getDocs(ordersQuery);
      for (const orderDoc of ordersSnapshot.docs) {
        await deleteDoc(doc(db, 'subOrders', orderDoc.id));
      }
      
      // 4. Finally delete the fournisseur
      await deleteDoc(doc(db, 'Fournisseurs', fournisseur.id));
      
      setFournisseur(null);
      setShowDeleteModal(false);
      resetForm();
    } catch (error) {
      console.error('Error deleting fournisseur:', error);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      matriculeFiscale: '',
      address: '',
      openingHours: '',
      image: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Information</h1>
          <p className="mt-2 text-gray-600">Manage your supplier profile and business details</p>
        </div>
        {fournisseur && !editing && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Information
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-6 py-3 border border-red-200 text-sm font-medium rounded-2xl text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Business
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {!fournisseur && !editing ? (
          // No supplier profile exists
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
              <IdentificationIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Your Supplier Profile
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Set up your supplier information to start managing your business on our platform.
            </p>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Create Supplier Profile
            </button>
          </div>
        ) : editing ? (
          // Edit/Create Form
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Registration Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.matriculeFiscale}
                      onChange={(e) => setFormData({...formData, matriculeFiscale: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tax registration number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.openingHours}
                      onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 9:00 AM - 6:00 PM"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your complete business address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter image URL for your business"
                    />
                  </div>

                  {formData.image && (
                    <div className="mt-4">
                      <img
                        src={formData.image}
                        alt="Business preview"
                        className="w-full h-32 object-cover rounded-2xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (fournisseur) {
                      setFormData({
                        name: fournisseur.name,
                        matriculeFiscale: fournisseur.matriculeFiscale,
                        address: fournisseur.address,
                        openingHours: fournisseur.openingHours,
                        image: fournisseur.image
                      });
                    } else {
                      resetForm();
                    }
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {fournisseur ? 'Update Business' : 'Create Business'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Display Mode
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Business Image */}
              <div className="lg:col-span-1">
                <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
                  {fournisseur.image ? (
                    <img
                      src={fournisseur.image}
                      alt={fournisseur.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Business Details */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{fournisseur.name}</h2>
                  <p className="text-gray-600">Established {new Date(fournisseur.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center mb-3">
                      <IdentificationIcon className="h-6 w-6 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Tax Registration</h3>
                    </div>
                    <p className="text-gray-700">{fournisseur.matriculeFiscale}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center mb-3">
                      <ClockIcon className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Opening Hours</h3>
                    </div>
                    <p className="text-gray-700">{fournisseur.openingHours}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <MapPinIcon className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Business Address</h3>
                  </div>
                  <p className="text-gray-700">{fournisseur.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
              Delete Business Profile
            </h3>
            <p className="text-gray-600 text-center mb-8">
              This action will permanently delete your business profile and all associated data including products, categories, and orders. This cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Business'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fournisseur;