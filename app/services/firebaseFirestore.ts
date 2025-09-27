import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { RxStructured, AdherenceStatus, CheckIn, Alert, WeeklyReport, IntakeEvent } from '../../types/api';

export class FirebaseFirestoreService {
  // Collections
  private static readonly COLLECTIONS = {
    PRESCRIPTIONS: 'prescriptions',
    ADHERENCE: 'adherence',
    CHECKINS: 'checkins',
    ALERTS: 'alerts',
    REPORTS: 'reports',
    INTAKE_EVENTS: 'intake_events',
    USERS: 'users'
  };

  // Prescription methods
  static async getPrescriptions(patientId: string): Promise<RxStructured[]> {
    try {
      const prescriptionsRef = collection(db, this.COLLECTIONS.PRESCRIPTIONS);
      const q = query(prescriptionsRef, where('patient_id', '==', patientId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as RxStructured[];
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      throw error;
    }
  }

  static async addPrescription(prescription: Omit<RxStructured, 'rx_id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.PRESCRIPTIONS), {
        ...prescription,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding prescription:', error);
      throw error;
    }
  }

  static async updatePrescription(rxId: string, updates: Partial<RxStructured>): Promise<void> {
    try {
      const prescriptionRef = doc(db, this.COLLECTIONS.PRESCRIPTIONS, rxId);
      await updateDoc(prescriptionRef, {
        ...updates,
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }

  static async deletePrescription(rxId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTIONS.PRESCRIPTIONS, rxId));
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  }

  // Adherence methods
  static async getAdherence(patientId: string): Promise<AdherenceStatus[]> {
    try {
      const adherenceRef = collection(db, this.COLLECTIONS.ADHERENCE);
      const q = query(adherenceRef, where('patient_id', '==', patientId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as AdherenceStatus[];
    } catch (error) {
      console.error('Error getting adherence:', error);
      throw error;
    }
  }

  static async updateAdherence(patientId: string, rxId: string, adherenceData: Partial<AdherenceStatus>): Promise<void> {
    try {
      const adherenceRef = doc(db, this.COLLECTIONS.ADHERENCE, `${patientId}_${rxId}`);
      await updateDoc(adherenceRef, {
        ...adherenceData,
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating adherence:', error);
      throw error;
    }
  }

  // Check-in methods
  static async getCheckins(patientId: string): Promise<CheckIn[]> {
    try {
      const checkinsRef = collection(db, this.COLLECTIONS.CHECKINS);
      const q = query(
        checkinsRef, 
        where('patient_id', '==', patientId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CheckIn[];
    } catch (error) {
      console.error('Error getting checkins:', error);
      throw error;
    }
  }

  static async respondToCheckin(checkInId: string, response: string): Promise<void> {
    try {
      const checkinRef = doc(db, this.COLLECTIONS.CHECKINS, checkInId);
      await updateDoc(checkinRef, {
        response,
        responded_at: Timestamp.now(),
        status: 'completed'
      });
    } catch (error) {
      console.error('Error responding to checkin:', error);
      throw error;
    }
  }

  // Intake event methods
  static async logIntakeEvent(intakeEvent: Omit<IntakeEvent, 'timestamp'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.INTAKE_EVENTS), {
        ...intakeEvent,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging intake event:', error);
      throw error;
    }
  }

  static async addIntakeEvent(intakeEvent: IntakeEvent): Promise<void> {
    try {
      await addDoc(collection(db, this.COLLECTIONS.INTAKE_EVENTS), {
        ...intakeEvent,
        created_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding intake event:', error);
      throw error;
    }
  }

  static async getIntakeHistory(patientId: string, rxId?: string): Promise<IntakeEvent[]> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.INTAKE_EVENTS),
        where('patient_id', '==', patientId),
        orderBy('timestamp', 'desc')
      );

      if (rxId) {
        q = query(q, where('rx_id', '==', rxId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as IntakeEvent));
    } catch (error) {
      console.error('Error getting intake history:', error);
      throw error;
    }
  }

  static async getPrescription(rxId: string): Promise<RxStructured> {
    try {
      const docRef = doc(db, this.COLLECTIONS.PRESCRIPTIONS, rxId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { ...docSnap.data(), rx_id: rxId } as RxStructured;
      } else {
        throw new Error('Prescription not found');
      }
    } catch (error) {
      console.error('Error getting prescription:', error);
      throw error;
    }
  }

  // Alert methods
  static async getAlerts(patientId: string): Promise<Alert[]> {
    try {
      const alertsRef = collection(db, this.COLLECTIONS.ALERTS);
      const q = query(
        alertsRef, 
        where('patient_id', '==', patientId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Alert[];
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw error;
    }
  }

  // Report methods
  static async getReports(patientId: string): Promise<WeeklyReport[]> {
    try {
      const reportsRef = collection(db, this.COLLECTIONS.REPORTS);
      const q = query(
        reportsRef, 
        where('patient_id', '==', patientId),
        orderBy('week_start', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as WeeklyReport[];
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  }

  static async generateReport(patientId: string, reportData: Omit<WeeklyReport, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.REPORTS), {
        ...reportData,
        created_at: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}
