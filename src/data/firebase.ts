/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDocFromServer,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect if placeholder is active or if the user has provided real credentials
export const isFirebasePlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('placeholder') ||
  firebaseConfig.projectId.includes('placeholder');

let app: any = null;
export let db: any = null;
export let auth: any = null;

if (!isFirebasePlaceholder) {
  try {
    app = initializeApp(firebaseConfig);
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    db = initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      },
      dbId
    );
    auth = getAuth(app);
    
    // Validate connection to Firestore as per skill guidelines
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test-connection-probe', 'probe'));
      } catch (error) {
        console.warn(
          "Firestore connection test: Client is currently operating in offline/unreachable mode.",
          error instanceof Error ? error.message : error
        );
      }
    };
    testConnection();
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fetch all documents from a Firestore collection
export async function getCollectionData(collectionName: string): Promise<any[] | null> {
  if (isFirebasePlaceholder || !db) return null;
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const items: any[] = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return null;
  }
}

// Set a single document securely
export async function setDocumentData(collectionName: string, docId: string, data: any): Promise<void> {
  if (isFirebasePlaceholder || !db) return;
  try {
    // Avoid storing undefined properties in Firestore
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, collectionName, docId), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// Bulk update / sync an entire collection using Batches
export async function setCollectionData(collectionName: string, items: any[]): Promise<void> {
  if (isFirebasePlaceholder || !db) return;
  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const cleanItem = JSON.parse(JSON.stringify(item));
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, cleanItem);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

export async function deleteDocumentData(collectionName: string, docId: string): Promise<void> {
  if (isFirebasePlaceholder || !db) return;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

export async function deleteDocumentsBatch(collectionName: string, docIds: string[]): Promise<void> {
  if (isFirebasePlaceholder || !db || docIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    docIds.forEach(id => {
      batch.delete(doc(db, collectionName, id));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionName);
  }
}
