import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Survey, SurveyResponse } from '../types';

export const useSurveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'surveys'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const surveysData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Survey[];
        setSurveys(surveysData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createSurvey = async (survey: Omit<Survey, 'id'>) => {
    await addDoc(collection(db, 'surveys'), {
      ...survey,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  const updateSurvey = async (id: string, updates: Partial<Survey>) => {
    await updateDoc(doc(db, 'surveys', id), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteSurvey = async (id: string) => {
    await deleteDoc(doc(db, 'surveys', id));
  };

  return { surveys, loading, createSurvey, updateSurvey, deleteSurvey };
};

export const useResponses = (surveyId?: string) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'responses'), orderBy('submittedAt', 'desc'));
    
    if (surveyId) {
      q = query(
        collection(db, 'responses'), 
        where('surveyId', '==', surveyId),
        orderBy('submittedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const responsesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
      })) as SurveyResponse[];
      setResponses(responsesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [surveyId]);

  const submitResponse = async (response: Omit<SurveyResponse, 'id'>) => {
    await addDoc(collection(db, 'responses'), {
      ...response,
      submittedAt: Timestamp.now(),
    });
  };

  return { responses, loading, submitResponse };
};