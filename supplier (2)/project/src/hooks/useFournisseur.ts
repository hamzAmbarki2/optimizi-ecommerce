import { useState, useEffect } from 'react';
import { FournisseurService } from '../services/fournisseurService';
import { Fournisseur } from '../models';
import { useAuth } from '../contexts/AuthContext';

export const useFournisseur = () => {
  const { userData } = useAuth();
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFournisseur = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fournisseurData = await FournisseurService.getFournisseurByOwnerId(userData.uid);
      setFournisseur(fournisseurData);
    } catch (err) {
      console.error('Error fetching fournisseur:', err);
      setError('Failed to fetch supplier information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseur();
  }, [userData]);

  const createFournisseur = async (data: Omit<Fournisseur, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await FournisseurService.createFournisseur(data);
      const newFournisseur = {
        id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setFournisseur(newFournisseur);
      return newFournisseur;
    } catch (err) {
      console.error('Error creating fournisseur:', err);
      throw err;
    }
  };

  const updateFournisseur = async (data: Partial<Fournisseur>) => {
    if (!fournisseur) return;

    try {
      await FournisseurService.updateFournisseur(fournisseur.id, data);
      setFournisseur({ ...fournisseur, ...data });
    } catch (err) {
      console.error('Error updating fournisseur:', err);
      throw err;
    }
  };

  const deleteFournisseur = async () => {
    if (!fournisseur) return;

    try {
      await FournisseurService.deleteFournisseur(fournisseur.id);
      setFournisseur(null);
    } catch (err) {
      console.error('Error deleting fournisseur:', err);
      throw err;
    }
  };

  return {
    fournisseur,
    loading,
    error,
    refetch: fetchFournisseur,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur
  };
};