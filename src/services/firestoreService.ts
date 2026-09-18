import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ProjectItem, MaterialRequest, MasterMaterialItem, MaterialShipment, ForemanItem, WorkPlan } from '../types';

export const COLLECTIONS = {
  PROJECTS: 'projects',
  MATERIAL_REQUESTS: 'material_requests',
  MASTER_MATERIALS: 'master_materials',
  MATERIAL_SHIPMENTS: 'material_shipments',
  FOREMEN: 'foremen',
  WORK_PLANS: 'work_plans',
} as const;

// ---------------------------------------------------------------------------
// Realtime Subscriptions with Error Handlers
// ---------------------------------------------------------------------------

export function subscribeToProjects(
  onData: (projects: ProjectItem[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.PROJECTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ProjectItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ProjectItem);
      });
      // Sort by 'no' or 'updatedAt'
      items.sort((a, b) => (a.no || 0) - (b.no || 0));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToMaterialRequests(
  onData: (requests: MaterialRequest[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.MATERIAL_REQUESTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MaterialRequest[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MaterialRequest);
      });
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToMasterMaterials(
  onData: (materials: MasterMaterialItem[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.MASTER_MATERIALS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MasterMaterialItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MasterMaterialItem);
      });
      items.sort((a, b) => a.kodeMaterial.localeCompare(b.kodeMaterial));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToMaterialShipments(
  onData: (shipments: MaterialShipment[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.MATERIAL_SHIPMENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MaterialShipment[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MaterialShipment);
      });
      items.sort((a, b) => new Date(b.tanggalKirim || b.createdAt || 0).getTime() - new Date(a.tanggalKirim || a.createdAt || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToForemen(
  onData: (foremen: ForemanItem[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.FOREMEN;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ForemanItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ForemanItem);
      });
      items.sort((a, b) => a.namaMandor.localeCompare(b.namaMandor));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToWorkPlans(
  onData: (workPlans: WorkPlan[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.WORK_PLANS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: WorkPlan[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as WorkPlan);
      });
      items.sort((a, b) => new Date(b.tanggal || b.createdAt || 0).getTime() - new Date(a.tanggal || a.createdAt || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ---------------------------------------------------------------------------
// Write Operations
// ---------------------------------------------------------------------------

export async function saveProjectToFirestore(project: ProjectItem) {
  const path = `${COLLECTIONS.PROJECTS}/${project.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProjectFromFirestore(projectId: string) {
  const path = `${COLLECTIONS.PROJECTS}/${projectId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.PROJECTS, projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMaterialRequestToFirestore(request: MaterialRequest) {
  const path = `${COLLECTIONS.MATERIAL_REQUESTS}/${request.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.MATERIAL_REQUESTS, request.id), request);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMaterialRequestFromFirestore(requestId: string) {
  const path = `${COLLECTIONS.MATERIAL_REQUESTS}/${requestId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MATERIAL_REQUESTS, requestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMasterMaterialToFirestore(material: MasterMaterialItem) {
  const path = `${COLLECTIONS.MASTER_MATERIALS}/${material.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.MASTER_MATERIALS, material.id), material);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMasterMaterialFromFirestore(materialId: string) {
  const path = `${COLLECTIONS.MASTER_MATERIALS}/${materialId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MASTER_MATERIALS, materialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMaterialShipmentToFirestore(shipment: MaterialShipment) {
  const path = `${COLLECTIONS.MATERIAL_SHIPMENTS}/${shipment.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.MATERIAL_SHIPMENTS, shipment.id), shipment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMaterialShipmentFromFirestore(shipmentId: string) {
  const path = `${COLLECTIONS.MATERIAL_SHIPMENTS}/${shipmentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MATERIAL_SHIPMENTS, shipmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveForemanToFirestore(foreman: ForemanItem) {
  const path = `${COLLECTIONS.FOREMEN}/${foreman.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FOREMEN, foreman.id), foreman);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteForemanFromFirestore(foremanId: string) {
  const path = `${COLLECTIONS.FOREMEN}/${foremanId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FOREMEN, foremanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveWorkPlanToFirestore(workPlan: WorkPlan) {
  const path = `${COLLECTIONS.WORK_PLANS}/${workPlan.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.WORK_PLANS, workPlan.id), workPlan);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWorkPlanFromFirestore(workPlanId: string) {
  const path = `${COLLECTIONS.WORK_PLANS}/${workPlanId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.WORK_PLANS, workPlanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// Seed Data to Firestore
// ---------------------------------------------------------------------------

export async function seedInitialDataIfEmpty(
  initialProjects: ProjectItem[],
  initialMaterialRequests: MaterialRequest[],
  initialMasterMaterials: MasterMaterialItem[],
  initialMaterialShipments: MaterialShipment[] = [],
  initialForemen: ForemanItem[] = [],
  initialWorkPlans: WorkPlan[] = []
) {
  try {
    // Check projects
    const projSnap = await getDocs(collection(db, COLLECTIONS.PROJECTS));
    if (projSnap.empty && initialProjects.length > 0) {
      console.log('Seeding initial projects to Firestore...');
      const batch = writeBatch(db);
      initialProjects.forEach((p) => {
        batch.set(doc(db, COLLECTIONS.PROJECTS, p.id), p);
      });
      await batch.commit();
    }

    // Check material requests
    const reqSnap = await getDocs(collection(db, COLLECTIONS.MATERIAL_REQUESTS));
    if (reqSnap.empty && initialMaterialRequests.length > 0) {
      console.log('Seeding initial material requests to Firestore...');
      const batch = writeBatch(db);
      initialMaterialRequests.forEach((r) => {
        batch.set(doc(db, COLLECTIONS.MATERIAL_REQUESTS, r.id), r);
      });
      await batch.commit();
    }

    // Check master materials
    const matSnap = await getDocs(collection(db, COLLECTIONS.MASTER_MATERIALS));
    if (matSnap.empty && initialMasterMaterials.length > 0) {
      console.log('Seeding initial master materials to Firestore...');
      const chunkSize = 400;
      for (let i = 0; i < initialMasterMaterials.length; i += chunkSize) {
        const chunk = initialMasterMaterials.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((m) => {
          batch.set(doc(db, COLLECTIONS.MASTER_MATERIALS, m.id), m);
        });
        await batch.commit();
      }
    }

    // Check material shipments
    const shpSnap = await getDocs(collection(db, COLLECTIONS.MATERIAL_SHIPMENTS));
    if (shpSnap.empty && initialMaterialShipments.length > 0) {
      console.log('Seeding initial material shipments to Firestore...');
      const batch = writeBatch(db);
      initialMaterialShipments.forEach((s) => {
        batch.set(doc(db, COLLECTIONS.MATERIAL_SHIPMENTS, s.id), s);
      });
      await batch.commit();
    }

    // Check foremen
    const fmnSnap = await getDocs(collection(db, COLLECTIONS.FOREMEN));
    if (fmnSnap.empty && initialForemen.length > 0) {
      console.log('Seeding initial foremen to Firestore...');
      const batch = writeBatch(db);
      initialForemen.forEach((f) => {
        batch.set(doc(db, COLLECTIONS.FOREMEN, f.id), f);
      });
      await batch.commit();
    }

    // Check work plans
    const wpSnap = await getDocs(collection(db, COLLECTIONS.WORK_PLANS));
    if (wpSnap.empty && initialWorkPlans.length > 0) {
      console.log('Seeding initial work plans to Firestore...');
      const batch = writeBatch(db);
      initialWorkPlans.forEach((wp) => {
        batch.set(doc(db, COLLECTIONS.WORK_PLANS, wp.id), wp);
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('Could not seed initial data to Firestore (will use local cache):', error);
  }
}
