import React, { useState, useEffect, useMemo } from 'react';
import { ProjectItem, ProjectFilter, DailyLog, ProjectCategory, MaterialRequest, MasterMaterialItem, MasterMaterialCategory, MaterialShipment, MaterialShipmentStatus, ForemanItem, ForemanStatus, WorkPlan, WorkPlanItem, WorkPlanStatus } from './types';
import { INITIAL_PROJECTS } from './data/initialData';
import { INITIAL_MATERIAL_REQUESTS } from './data/initialMaterialRequests';
import { INITIAL_MASTER_MATERIALS } from './data/initialMasterMaterials';
import { INITIAL_MATERIAL_SHIPMENTS } from './data/initialMaterialShipments';
import { INITIAL_FOREMEN } from './data/initialForemen';
import { INITIAL_WORK_PLANS } from './data/initialWorkPlans';
import { exportProjectsToCSV } from './utils/formatters';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { ProjectSummaryCharts } from './components/ProjectSummaryCharts';
import { FilterBar } from './components/FilterBar';
import { ProjectTable } from './components/ProjectTable';
import { TimelineView } from './components/TimelineView';
import { ProjectModal } from './components/ProjectModal';
import { DailyLogModal } from './components/DailyLogModal';
import { DailyLogPrintModal } from './components/DailyLogPrintModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { PrintReportView } from './components/PrintReportView';
import { ImportSPBJModal } from './components/ImportSPBJModal';
import { MaterialRequestModal } from './components/MaterialRequestModal';
import { MaterialRequestPrintModal } from './components/MaterialRequestPrintModal';
import { MaterialRequestList } from './components/MaterialRequestList';
import { MasterMaterialView } from './components/MasterMaterialView';
import { MasterMaterialModal } from './components/MasterMaterialModal';
import { MaterialShipmentList } from './components/MaterialShipmentList';
import { MaterialShipmentModal } from './components/MaterialShipmentModal';
import { MaterialShipmentPrintModal } from './components/MaterialShipmentPrintModal';
import { ForemanList } from './components/ForemanList';
import { ForemanModal } from './components/ForemanModal';
import { WorkPlanList } from './components/WorkPlanList';
import { WorkPlanModal } from './components/WorkPlanModal';
import { WorkPlanPrintModal } from './components/WorkPlanPrintModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Sidebar, ActiveViewType } from './components/Sidebar';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  Zap, 
  LayoutList, 
  Calendar, 
  CalendarCheck2,
  Package, 
  Sparkles,
  PackagePlus,
  Database,
  Truck,
  HardHat
} from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  subscribeToProjects,
  subscribeToMaterialRequests,
  subscribeToMasterMaterials,
  subscribeToMaterialShipments,
  subscribeToForemen,
  subscribeToWorkPlans,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  saveMaterialRequestToFirestore,
  deleteMaterialRequestFromFirestore,
  saveMasterMaterialToFirestore,
  deleteMasterMaterialFromFirestore,
  saveMaterialShipmentToFirestore,
  deleteMaterialShipmentFromFirestore,
  saveForemanToFirestore,
  deleteForemanFromFirestore,
  saveWorkPlanToFirestore,
  deleteWorkPlanFromFirestore,
  seedInitialDataIfEmpty,
} from './services/firestoreService';

const STORAGE_KEY = 'monitoring_proyek_kelistrikan_v1';
const MATERIAL_REQUESTS_KEY = 'pln_monitoring_material_requests_v1';
const MASTER_MATERIALS_KEY = 'pln_monitoring_master_materials_v1';
const MATERIAL_SHIPMENTS_KEY = 'pln_monitoring_material_shipments_v1';
const FOREMEN_KEY = 'pln_monitoring_foremen_v1';
const WORK_PLANS_KEY = 'pln_monitoring_work_plans_v1';

const CATEGORIES: { key: ProjectCategory | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Semua Kategori' },
  { key: 'TM', label: 'TM 20kV' },
  { key: 'TR', label: 'TR 380V' },
  { key: 'Gardu', label: 'Gardu & Trafo' },
  { key: 'Panel', label: 'Panel & Cubicle' },
  { key: 'Jaringan', label: 'Jaringan Distribusi' },
  { key: 'Grounding', label: 'Grounding & Petir' },
];

export default function App() {
  // Load from local storage or initial data
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load projects from localStorage', e);
    }
    return INITIAL_PROJECTS;
  });

  // Material Requests (MDU & Non-MDU) state
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(() => {
    try {
      const saved = localStorage.getItem(MATERIAL_REQUESTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load material requests from localStorage', e);
    }
    return INITIAL_MATERIAL_REQUESTS;
  });

  // Master Materials (MDU & Non-MDU) state
  const [masterMaterials, setMasterMaterials] = useState<MasterMaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(MASTER_MATERIALS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load master materials from localStorage', e);
    }
    return INITIAL_MASTER_MATERIALS;
  });

  // Material Shipments (Ekspedisi & Surat Jalan) state
  const [materialShipments, setMaterialShipments] = useState<MaterialShipment[]>(() => {
    try {
      const saved = localStorage.getItem(MATERIAL_SHIPMENTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load material shipments from localStorage', e);
    }
    return INITIAL_MATERIAL_SHIPMENTS;
  });

  // Foremen (Daftar Mandor & Penugasan Multi-Lokasi / PIC) state
  const [foremen, setForemen] = useState<ForemanItem[]>(() => {
    try {
      const saved = localStorage.getItem(FOREMEN_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load foremen from localStorage', e);
    }
    return INITIAL_FOREMEN;
  });

  // Work Plans (Rencana Kerja Lapangan) state
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>(() => {
    try {
      const saved = localStorage.getItem(WORK_PLANS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load work plans from localStorage', e);
    }
    return INITIAL_WORK_PLANS;
  });

  // Firebase Auth and Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Realtime synchronization with Firestore (with automatic seeding if empty)
  useEffect(() => {
    // Seed standard initial data to Firestore if the cloud collections are empty
    seedInitialDataIfEmpty(
      INITIAL_PROJECTS,
      INITIAL_MATERIAL_REQUESTS,
      INITIAL_MASTER_MATERIALS,
      INITIAL_MATERIAL_SHIPMENTS,
      INITIAL_FOREMEN,
      INITIAL_WORK_PLANS
    );

    const unsubProjects = subscribeToProjects(
      (items) => {
        if (items.length > 0) {
          setProjects(items);
        }
        setIsCloudConnected(true);
      },
      (error) => {
        console.warn('Projects Firestore offline/error, using local cache:', error);
        setIsCloudConnected(false);
      }
    );

    const unsubRequests = subscribeToMaterialRequests(
      (items) => {
        if (items.length > 0) {
          setMaterialRequests(items);
        }
      },
      (error) => {
        console.warn('Material requests Firestore offline/error:', error);
      }
    );

    const unsubMaterials = subscribeToMasterMaterials(
      (items) => {
        if (items.length > 0) {
          setMasterMaterials(items);
        }
      },
      (error) => {
        console.warn('Master materials Firestore offline/error:', error);
      }
    );

    const unsubShipments = subscribeToMaterialShipments(
      (items) => {
        if (items.length > 0) {
          setMaterialShipments(items);
        }
      },
      (error) => {
        console.warn('Material shipments Firestore offline/error:', error);
      }
    );

    const unsubForemen = subscribeToForemen(
      (items) => {
        if (items.length > 0) {
          setForemen(items);
        }
      },
      (error) => {
        console.warn('Foremen Firestore offline/error:', error);
      }
    );

    const unsubWorkPlans = subscribeToWorkPlans(
      (items) => {
        if (items.length > 0) {
          setWorkPlans(items);
        }
      },
      (error) => {
        console.warn('Work plans Firestore offline/error:', error);
      }
    );

    return () => {
      unsubProjects();
      unsubRequests();
      unsubMaterials();
      unsubShipments();
      unsubForemen();
      unsubWorkPlans();
    };
  }, []);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Save to local storage whenever projects change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [projects]);

  // Save to local storage whenever materialRequests change
  useEffect(() => {
    try {
      localStorage.setItem(MATERIAL_REQUESTS_KEY, JSON.stringify(materialRequests));
    } catch (e) {
      console.error('Failed to save material requests to localStorage', e);
    }
  }, [materialRequests]);

  // Save to local storage whenever masterMaterials change
  useEffect(() => {
    try {
      localStorage.setItem(MASTER_MATERIALS_KEY, JSON.stringify(masterMaterials));
    } catch (e) {
      console.error('Failed to save master materials to localStorage', e);
    }
  }, [masterMaterials]);

  // Save to local storage whenever materialShipments change
  useEffect(() => {
    try {
      localStorage.setItem(MATERIAL_SHIPMENTS_KEY, JSON.stringify(materialShipments));
    } catch (e) {
      console.error('Failed to save material shipments to localStorage', e);
    }
  }, [materialShipments]);

  // Save to local storage whenever foremen change
  useEffect(() => {
    try {
      localStorage.setItem(FOREMEN_KEY, JSON.stringify(foremen));
    } catch (e) {
      console.error('Failed to save foremen to localStorage', e);
    }
  }, [foremen]);

  // Save to local storage whenever workPlans change
  useEffect(() => {
    try {
      localStorage.setItem(WORK_PLANS_KEY, JSON.stringify(workPlans));
    } catch (e) {
      console.error('Failed to save work plans to localStorage', e);
    }
  }, [workPlans]);

  // Filters State
  const [filter, setFilter] = useState<ProjectFilter>({
    search: '',
    status: 'ALL',
    kategori: 'ALL',
    pic: 'ALL',
    mandor: 'ALL',
    lokasi: '',
    sortBy: 'no',
    sortOrder: 'asc',
  });

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const [isDailyLogModalOpen, setIsDailyLogModalOpen] = useState(false);
  const [dailyLogProject, setDailyLogProject] = useState<ProjectItem | null>(null);

  // Daily Log PDF Print Modal state
  const [isDailyLogPrintModalOpen, setIsDailyLogPrintModalOpen] = useState(false);
  const [printingDailyLogProject, setPrintingDailyLogProject] = useState<ProjectItem | null>(null);
  const [printingDailyLogItem, setPrintingDailyLogItem] = useState<DailyLog | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Material Request Modals state
  const [isMaterialRequestModalOpen, setIsMaterialRequestModalOpen] = useState(false);
  const [editingMaterialRequest, setEditingMaterialRequest] = useState<MaterialRequest | null>(null);
  const [prefilledProjectIdForRequest, setPrefilledProjectIdForRequest] = useState<string | null>(null);

  const [isMaterialRequestPrintModalOpen, setIsMaterialRequestPrintModalOpen] = useState(false);
  const [printingMaterialRequest, setPrintingMaterialRequest] = useState<MaterialRequest | null>(null);

  // Master Material Modals state
  const [isMasterMaterialModalOpen, setIsMasterMaterialModalOpen] = useState(false);
  const [editingMasterMaterial, setEditingMasterMaterial] = useState<MasterMaterialItem | null>(null);
  const [defaultCategoryForMasterModal, setDefaultCategoryForMasterModal] = useState<MasterMaterialCategory>('MDU');

  // Material Shipment Modals state
  const [isMaterialShipmentModalOpen, setIsMaterialShipmentModalOpen] = useState(false);
  const [editingMaterialShipment, setEditingMaterialShipment] = useState<MaterialShipment | null>(null);
  const [isMaterialShipmentPrintModalOpen, setIsMaterialShipmentPrintModalOpen] = useState(false);
  const [printingMaterialShipment, setPrintingMaterialShipment] = useState<MaterialShipment | null>(null);

  // Foreman Modals state
  const [isForemanModalOpen, setIsForemanModalOpen] = useState(false);
  const [editingForeman, setEditingForeman] = useState<ForemanItem | null>(null);

  // Work Plan Modals state
  const [isWorkPlanModalOpen, setIsWorkPlanModalOpen] = useState(false);
  const [editingWorkPlan, setEditingWorkPlan] = useState<WorkPlan | null>(null);
  const [isWorkPlanPrintModalOpen, setIsWorkPlanPrintModalOpen] = useState(false);
  const [printingWorkPlan, setPrintingWorkPlan] = useState<WorkPlan | null>(null);

  // Active View: Table, Timeline, Material Requests, Master Materials, Material Shipments, Foremen, or Work Plans
  const [activeView, setActiveView] = useState<ActiveViewType>('table');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Custom In-App Confirmation Modal (ensures 100% reliability in sandboxed iframes without window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDetail?: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Total installed materials recorded
  const totalInstalledMaterials = useMemo(() => {
    let count = 0;
    projects.forEach(p => {
      (p.dailyLogs || []).forEach(log => {
        count += (log.materialTerpasang || []).length;
      });
    });
    return count;
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search matching
        if (filter.search) {
          const query = filter.search.toLowerCase().trim();
          const matchNo = p.no.toString().includes(query);
          const matchNama = p.namaPekerjaan.toLowerCase().includes(query);
          const matchLokasi = p.lokasi.toLowerCase().includes(query);
          const matchSPBJ = p.noSPBJ.toLowerCase().includes(query);
          const matchPIC = p.pic.toLowerCase().includes(query);
          const matchMandor = p.mandor.toLowerCase().includes(query);

          if (!matchNo && !matchNama && !matchLokasi && !matchSPBJ && !matchPIC && !matchMandor) {
            return false;
          }
        }

        // Status matching
        if (filter.status !== 'ALL' && p.status !== filter.status) {
          return false;
        }

        // Kategori matching
        if (filter.kategori !== 'ALL' && p.kategori !== filter.kategori) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[filter.sortBy as keyof ProjectItem];
        let valB: any = b[filter.sortBy as keyof ProjectItem];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return filter.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return filter.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projects, filter]);

  // Handlers
  const handleSaveProject = (savedProject: ProjectItem) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === savedProject.id);
      if (exists) {
        showToast(`Data pekerjaan "${savedProject.namaPekerjaan}" berhasil diperbarui.`, 'success');
        return prev.map((p) => (p.id === savedProject.id ? savedProject : p));
      } else {
        showToast(`Pekerjaan baru No. ${savedProject.no} berhasil ditambahkan.`, 'success');
        return [...prev, savedProject];
      }
    });
    // Persist to Firebase Firestore
    saveProjectToFirestore(savedProject).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
  };

  const handleDeleteProject = (id: string, namaPekerjaan: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Pekerjaan',
      message: 'Apakah Anda yakin ingin menghapus data pekerjaan ini? Data SPBJ, progres fisik, dan seluruh catatan log harian lapangan terkait akan dihapus secara permanen.',
      itemDetail: namaPekerjaan,
      confirmText: 'Ya, Hapus Pekerjaan',
      variant: 'danger',
      onConfirm: () => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        deleteProjectFromFirestore(id).catch((err) =>
          console.warn('Firestore delete warning:', err)
        );
        showToast(`Pekerjaan "${namaPekerjaan}" telah berhasil dihapus.`, 'info');
      },
    });
  };

  const handleSaveDailyLog = (
    projectId: string,
    log: DailyLog,
    updatedProgress: number,
    updatedCatatan: string
  ) => {
    let updatedProject: ProjectItem | null = null;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const newStatus = updatedProgress >= 100 ? 'COMPLETED' : p.status === 'PENDING' ? 'ON_PROGRESS' : p.status;
          updatedProject = {
            ...p,
            progressRealisasi: updatedProgress,
            catatanHarian: updatedCatatan,
            status: newStatus,
            dailyLogs: [log, ...(p.dailyLogs || [])],
            updatedAt: new Date().toISOString(),
          };
          return updatedProject;
        }
        return p;
      })
    );
    if (updatedProject) {
      saveProjectToFirestore(updatedProject).catch((err) =>
        console.warn('Firestore write warning:', err)
      );
    }
    showToast('Laporan harian pekerjaan berhasil disimpan.', 'success');
  };

  const handleOpenDailyLogPrint = (project: ProjectItem, log: DailyLog) => {
    setPrintingDailyLogProject(project);
    setPrintingDailyLogItem(log);
    setIsDailyLogPrintModalOpen(true);
  };

  const handleSaveAndPrintDailyLog = (
    projectId: string,
    log: DailyLog,
    updatedProgress: number,
    updatedCatatan: string
  ) => {
    handleSaveDailyLog(projectId, log, updatedProgress, updatedCatatan);
    const targetProject = projects.find((p) => p.id === projectId) || dailyLogProject;
    if (targetProject) {
      setPrintingDailyLogProject(targetProject);
      setPrintingDailyLogItem(log);
      setIsDailyLogPrintModalOpen(true);
    }
  };

  const handleImportSuccess = (newProject: ProjectItem) => {
    setProjects((prev) => [newProject, ...prev]);
    saveProjectToFirestore(newProject).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
    showToast(`Berhasil mengonversi dokumen SPBJ No. ${newProject.noSPBJ} menjadi data proyek!`, 'success');
  };

  const handleResetToDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Muat Ulang Seluruh Data Contoh',
      message: 'Apakah Anda yakin ingin memuat ulang seluruh data contoh standar pekerjaan & bon permintaan material? Seluruh perubahan kustom akan dikembalikan ke kondisi awal.',
      confirmText: 'Ya, Muat Ulang',
      variant: 'warning',
      onConfirm: () => {
        setProjects(INITIAL_PROJECTS);
        setMaterialRequests(INITIAL_MATERIAL_REQUESTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
        localStorage.setItem(MATERIAL_REQUESTS_KEY, JSON.stringify(INITIAL_MATERIAL_REQUESTS));
        // Sync reset to Firestore
        INITIAL_PROJECTS.forEach((p) => saveProjectToFirestore(p));
        INITIAL_MATERIAL_REQUESTS.forEach((r) => saveMaterialRequestToFirestore(r));
        showToast('Data contoh proyek & permintaan material telah dimuat ulang.', 'info');
      },
    });
  };

  const handleSaveMaterialRequest = (request: MaterialRequest) => {
    setMaterialRequests((prev) => {
      const exists = prev.some((r) => r.id === request.id);
      if (exists) {
        showToast(`Permintaan material ${request.nomorPermintaan} berhasil diperbarui.`, 'success');
        return prev.map((r) => (r.id === request.id ? request : r));
      } else {
        showToast(`Permintaan material baru ${request.nomorPermintaan} berhasil dibuat.`, 'success');
        return [request, ...prev];
      }
    });
    saveMaterialRequestToFirestore(request).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
  };

  const handleDeleteMaterialRequest = (id: string) => {
    const target = materialRequests.find((r) => r.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Bon Permintaan Material',
      message: 'Apakah Anda yakin ingin menghapus formulir permintaan material MDU & Non-MDU ini?',
      itemDetail: target ? `${target.nomorPermintaan} - ${target.namaPekerjaan}` : id,
      confirmText: 'Ya, Hapus Bon',
      variant: 'danger',
      onConfirm: () => {
        setMaterialRequests((prev) => prev.filter((r) => r.id !== id));
        deleteMaterialRequestFromFirestore(id).catch((err) =>
          console.warn('Firestore delete warning:', err)
        );
        showToast('Permintaan material telah dihapus.', 'info');
      },
    });
  };

  const handleCreateMaterialRequestForProject = (project: ProjectItem) => {
    setEditingMaterialRequest(null);
    setPrefilledProjectIdForRequest(project.id);
    setIsMaterialRequestModalOpen(true);
  };

  // Master Material handlers
  const handleSaveMasterMaterial = (item: MasterMaterialItem) => {
    setMasterMaterials((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      if (exists) {
        return prev.map((m) => (m.id === item.id ? item : m));
      } else {
        return [item, ...prev];
      }
    });
    saveMasterMaterialToFirestore(item).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
    showToast(`Master Material "${item.namaMaterial}" berhasil disimpan.`, 'success');
  };

  const handleDeleteMasterMaterial = (id: string, namaMaterial: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Master Material',
      message: 'Apakah Anda yakin ingin menghapus material ini dari daftar Master Data MDU & Non-MDU?',
      itemDetail: namaMaterial,
      confirmText: 'Ya, Hapus Material',
      variant: 'danger',
      onConfirm: () => {
        setMasterMaterials((prev) => prev.filter((m) => m.id !== id));
        deleteMasterMaterialFromFirestore(id).catch((err) =>
          console.warn('Firestore delete warning:', err)
        );
        showToast(`Master Material "${namaMaterial}" telah dihapus.`, 'info');
      },
    });
  };

  const handleResetMasterMaterials = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Master Material PLN (SPLN)',
      message: 'Apakah Anda yakin ingin memuat ulang katalog master material standar PLN (SPLN)? Penambahan kustom akan direset.',
      confirmText: 'Ya, Reset Katalog',
      variant: 'warning',
      onConfirm: () => {
        setMasterMaterials(INITIAL_MASTER_MATERIALS);
        localStorage.setItem(MASTER_MATERIALS_KEY, JSON.stringify(INITIAL_MASTER_MATERIALS));
        INITIAL_MASTER_MATERIALS.forEach((m) => saveMasterMaterialToFirestore(m));
        showToast('Master material berhasil direset ke standar PLN (SPLN).', 'info');
      },
    });
  };

  // Material Shipment handlers
  const handleSaveMaterialShipment = (shipment: MaterialShipment) => {
    setMaterialShipments((prev) => {
      const exists = prev.some((s) => s.id === shipment.id);
      if (exists) {
        showToast(`Surat Jalan ${shipment.nomorSuratJalan} berhasil diperbarui.`, 'success');
        return prev.map((s) => (s.id === shipment.id ? shipment : s));
      } else {
        showToast(`Surat Jalan ${shipment.nomorSuratJalan} berhasil dibuat.`, 'success');
        return [shipment, ...prev];
      }
    });
    saveMaterialShipmentToFirestore(shipment).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
  };

  const handleDeleteMaterialShipment = (id: string) => {
    const target = materialShipments.find((s) => s.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Surat Jalan Pengiriman',
      message: 'Apakah Anda yakin ingin menghapus surat jalan pengiriman ekspedisi material ini?',
      itemDetail: target ? `${target.nomorSuratJalan} (${target.namaEkspedisi} - ${target.pekerjaan})` : id,
      confirmText: 'Ya, Hapus Surat Jalan',
      variant: 'danger',
      onConfirm: () => {
        setMaterialShipments((prev) => prev.filter((s) => s.id !== id));
        deleteMaterialShipmentFromFirestore(id).catch((err) =>
          console.warn('Firestore delete warning:', err)
        );
        showToast('Surat jalan pengiriman telah dihapus.', 'info');
      },
    });
  };

  const handleStatusChangeMaterialShipment = (id: string, newStatus: MaterialShipmentStatus) => {
    setMaterialShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, status: newStatus, updatedAt: new Date().toISOString() };
          saveMaterialShipmentToFirestore(updated).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
          return updated;
        }
        return s;
      })
    );
    showToast(`Status pengiriman berhasil diubah menjadi ${newStatus}.`, 'info');
  };

  // Foreman (Daftar Mandor) handlers
  const handleSaveForeman = (foreman: ForemanItem) => {
    setForemen((prev) => {
      const exists = prev.some((f) => f.id === foreman.id);
      if (exists) {
        showToast(`Data ${foreman.namaMandor} berhasil diperbarui.`, 'success');
        return prev.map((f) => (f.id === foreman.id ? foreman : f));
      } else {
        showToast(`Data ${foreman.namaMandor} berhasil ditambahkan.`, 'success');
        return [foreman, ...prev];
      }
    });
    saveForemanToFirestore(foreman).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
  };

  const handleDeleteForeman = (id: string) => {
    const target = foremen.find((f) => f.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Mandor',
      message: 'Apakah Anda yakin ingin menghapus data mandor beserta daftar lokasi pekerjaan dan PIC pengawas terkait?',
      itemDetail: target ? `${target.namaMandor} (${target.assignments?.length || 0} Lokasi Penugasan)` : id,
      confirmText: 'Ya, Hapus Mandor',
      variant: 'danger',
      onConfirm: () => {
        setForemen((prev) => prev.filter((f) => f.id !== id));
        deleteForemanFromFirestore(id).catch((err) =>
          console.warn('Firestore delete warning:', err)
        );
        showToast('Data mandor telah dihapus.', 'info');
      },
    });
  };

  const handleStatusChangeForeman = (id: string, newStatus: ForemanStatus) => {
    setForemen((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, status: newStatus, updatedAt: new Date().toISOString() };
          saveForemanToFirestore(updated).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
          return updated;
        }
        return f;
      })
    );
    showToast(`Status mandor berhasil diubah menjadi ${newStatus}.`, 'info');
  };

  // Work Plan (Rencana Kerja) handlers
  const handleSaveWorkPlan = (plan: WorkPlan) => {
    setWorkPlans((prev) => {
      const exists = prev.some((w) => w.id === plan.id);
      if (exists) {
        showToast(`Rencana kerja ${plan.nomorRencana} berhasil diperbarui.`, 'success');
        return prev.map((w) => (w.id === plan.id ? plan : w));
      } else {
        showToast(`Rencana kerja ${plan.nomorRencana} (${plan.lokasi}) berhasil dibuat.`, 'success');
        return [plan, ...prev];
      }
    });
    saveWorkPlanToFirestore(plan).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
  };

  const handleUpdateWorkPlan = (plan: WorkPlan) => {
    setWorkPlans((prev) => prev.map((w) => (w.id === plan.id ? plan : w)));
    saveWorkPlanToFirestore(plan).catch((err) =>
      console.warn('Firestore write warning:', err)
    );
  };

  const handleDeleteWorkPlan = (id: string) => {
    const target = workPlans.find((w) => w.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Rencana Kerja',
      message: 'Apakah Anda yakin ingin menghapus rencana kerja ini beserta seluruh item uraian pekerjaannya?',
      itemDetail: target ? `${target.nomorRencana} - ${target.lokasi} (${target.items.length} Item Pekerjaan)` : id,
      confirmText: 'Ya, Hapus Rencana',
      variant: 'danger',
      onConfirm: () => {
        setWorkPlans((prev) => prev.filter((w) => w.id !== id));
        deleteWorkPlanFromFirestore(id).catch((err) =>
          console.warn('Firestore delete warning:', err)
        );
        showToast('Rencana kerja telah dihapus.', 'info');
      },
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      showToast(`Berhasil masuk sebagai ${user.displayName || user.email}!`, 'success');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast('Gagal masuk dengan Google: ' + (err?.message || ''), 'warning');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Berhasil keluar dari akun.', 'info');
    } catch (err: any) {
      showToast('Gagal keluar: ' + (err?.message || ''), 'warning');
    }
  };

  const handleResetFilters = () => {
    setFilter({
      search: '',
      status: 'ALL',
      kategori: 'ALL',
      pic: 'ALL',
      mandor: 'ALL',
      lokasi: '',
      sortBy: 'no',
      sortOrder: 'asc',
    });
  };

  const nextAvailableNo = useMemo(() => {
    if (projects.length === 0) return 1;
    return Math.max(...projects.map((p) => p.no || 0)) + 1;
  }, [projects]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold border border-slate-800">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        onAddProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onImportSPBJ={() => setIsImportModalOpen(true)}
        onExportCSV={() => exportProjectsToCSV(filteredProjects)}
        onPrintReport={() => setIsPrintModalOpen(true)}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        isCloudConnected={isCloudConnected}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* Main App Container with Left Sidebar & Content */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-[calc(100vh-65px)] bg-slate-50/50">
        {/* Left Sidebar Menu (Berjejer dari Atas ke Bawah) */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          totalProjects={projects.length}
          totalInstalledMaterials={totalInstalledMaterials}
          totalWorkPlans={workPlans.length}
          totalMaterialRequests={materialRequests.length}
          totalMaterialShipments={materialShipments.length}
          totalForemen={foremen.length}
          totalMasterMaterials={masterMaterials.length}
          onAddProject={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          onImportSPBJ={() => setIsImportModalOpen(true)}
          onExportCSV={() => exportProjectsToCSV(filteredProjects)}
          onPrintReport={() => setIsPrintModalOpen(true)}
          onResetData={handleResetToDefault}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
          {/* KPI & Summary Cards */}
          <StatsOverview projects={projects} />

          {/* Dashboard Visual Charts (Shown on Table View) */}
          {activeView === 'table' && (
            <ProjectSummaryCharts projects={projects} />
          )}

          {/* View Conditional Render */}
          {activeView === 'table' ? (
            <>
              {/* Filter Bar */}
              <FilterBar
                filter={filter}
                onChange={setFilter}
                onReset={handleResetFilters}
              />

              {/* Project Table (With Required Fields: No, Nama Pekerjaan, Lokasi, Nilai Kontrak, No SPBJ, PIC, Mandor Manpower) */}
              <ProjectTable
                projects={filteredProjects}
                onOpenDailyLog={(p) => {
                  setDailyLogProject(p);
                  setIsDailyLogModalOpen(true);
                }}
                onOpenDetail={(p) => {
                  setDetailProject(p);
                  setIsDetailModalOpen(true);
                }}
                onEditProject={(p) => {
                  setEditingProject(p);
                  setIsProjectModalOpen(true);
                }}
                onDeleteProject={handleDeleteProject}
                onCreateMaterialRequest={handleCreateMaterialRequestForProject}
                onPrintDailyLog={handleOpenDailyLogPrint}
              />
            </>
          ) : activeView === 'timeline' ? (
            /* Timeline & Installed Material View */
            <TimelineView
              projects={projects}
              onOpenDailyLog={(p) => {
                setDailyLogProject(p);
                setIsDailyLogModalOpen(true);
              }}
              onOpenDetail={(p) => {
                setDetailProject(p);
                setIsDetailModalOpen(true);
              }}
              onUpdateProject={handleSaveProject}
              onPrintDailyLog={handleOpenDailyLogPrint}
            />
          ) : activeView === 'work-plans' ? (
            /* Work Plan View (Rencana Kerja Lapangan) */
            <WorkPlanList
              workPlans={workPlans}
              projects={projects}
              foremen={foremen}
              onAddPlan={() => {
                setEditingWorkPlan(null);
                setIsWorkPlanModalOpen(true);
              }}
              onEditPlan={(plan) => {
                setEditingWorkPlan(plan);
                setIsWorkPlanModalOpen(true);
              }}
              onDeletePlan={handleDeleteWorkPlan}
              onUpdatePlan={handleUpdateWorkPlan}
              onPrintPlan={(plan) => {
                setPrintingWorkPlan(plan);
                setIsWorkPlanPrintModalOpen(true);
              }}
            />
          ) : activeView === 'material-requests' ? (
            /* Material Requests View (MDU & Non-MDU) */
            <MaterialRequestList
              requests={materialRequests}
              onCreateNew={() => {
                setEditingMaterialRequest(null);
                setPrefilledProjectIdForRequest(null);
                setIsMaterialRequestModalOpen(true);
              }}
              onEdit={(req) => {
                setEditingMaterialRequest(req);
                setPrefilledProjectIdForRequest(null);
                setIsMaterialRequestModalOpen(true);
              }}
              onDelete={handleDeleteMaterialRequest}
              onPrint={(req) => {
                setPrintingMaterialRequest(req);
                setIsMaterialRequestPrintModalOpen(true);
              }}
            />
          ) : activeView === 'material-shipments' ? (
            /* Material Shipments View (Ekspedisi & Surat Jalan) */
            <MaterialShipmentList
              shipments={materialShipments}
              onCreateNew={() => {
                setEditingMaterialShipment(null);
                setIsMaterialShipmentModalOpen(true);
              }}
              onEdit={(shipment) => {
                setEditingMaterialShipment(shipment);
                setIsMaterialShipmentModalOpen(true);
              }}
              onDelete={handleDeleteMaterialShipment}
              onPrint={(shipment) => {
                setPrintingMaterialShipment(shipment);
                setIsMaterialShipmentPrintModalOpen(true);
              }}
              onStatusChange={handleStatusChangeMaterialShipment}
            />
          ) : activeView === 'foremen' ? (
            /* Foremen View (Daftar Mandor, Multi-Lokasi & PIC) */
            <ForemanList
              foremen={foremen}
              onCreateNew={() => {
                setEditingForeman(null);
                setIsForemanModalOpen(true);
              }}
              onEdit={(f) => {
                setEditingForeman(f);
                setIsForemanModalOpen(true);
              }}
              onDelete={handleDeleteForeman}
              onStatusChange={handleStatusChangeForeman}
            />
          ) : (
            /* Master Material View (MDU & Non-MDU) */
            <MasterMaterialView
              materials={masterMaterials}
              onAddMaterial={(cat) => {
                setEditingMasterMaterial(null);
                setDefaultCategoryForMasterModal(cat || 'MDU');
                setIsMasterMaterialModalOpen(true);
              }}
              onEditMaterial={(item) => {
                setEditingMasterMaterial(item);
                setIsMasterMaterialModalOpen(true);
              }}
              onDeleteMaterial={handleDeleteMasterMaterial}
              onResetToDefault={handleResetMasterMaterials}
              onOpenMaterialRequests={() => setActiveView('material-requests')}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {/* 1. Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        projectToEdit={editingProject}
        nextNo={nextAvailableNo}
        onOpenImportPDF={() => setIsImportModalOpen(true)}
      />

      {/* 2. Daily Log Update Modal */}
      <DailyLogModal
        isOpen={isDailyLogModalOpen}
        project={dailyLogProject}
        onClose={() => {
          setIsDailyLogModalOpen(false);
          setDailyLogProject(null);
        }}
        onSaveLog={handleSaveDailyLog}
        onSaveAndPrint={handleSaveAndPrintDailyLog}
      />

      {/* 2b. Daily Log Single Print / Export PDF Modal */}
      <DailyLogPrintModal
        isOpen={isDailyLogPrintModalOpen}
        onClose={() => {
          setIsDailyLogPrintModalOpen(false);
          setPrintingDailyLogProject(null);
          setPrintingDailyLogItem(null);
        }}
        project={printingDailyLogProject}
        dailyLog={printingDailyLogItem}
        foremen={foremen}
      />

      {/* 3. Project Detail & Logs History Modal */}
      <ProjectDetailModal
        isOpen={isDetailModalOpen}
        project={detailProject}
        foremen={foremen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailProject(null);
        }}
        onOpenAddLog={(p) => {
          setIsDetailModalOpen(false);
          setDailyLogProject(p);
          setIsDailyLogModalOpen(true);
        }}
        onCreateMaterialRequest={(p) => {
          setIsDetailModalOpen(false);
          handleCreateMaterialRequestForProject(p);
        }}
        onPrintDailyLog={handleOpenDailyLogPrint}
      />

      {/* 4. Print Official SPBJ Daily Report View */}
      <PrintReportView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        projects={filteredProjects}
      />

      {/* 5. Import & Convert SPBJ / RAB PDF Modal */}
      <ImportSPBJModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        nextProjectNo={nextAvailableNo}
      />

      {/* 6. Material Request Create/Edit Modal */}
      <MaterialRequestModal
        isOpen={isMaterialRequestModalOpen}
        onClose={() => {
          setIsMaterialRequestModalOpen(false);
          setEditingMaterialRequest(null);
          setPrefilledProjectIdForRequest(null);
        }}
        onSave={handleSaveMaterialRequest}
        requestToEdit={editingMaterialRequest}
        projects={projects}
        prefilledProjectId={prefilledProjectIdForRequest}
        masterMaterials={masterMaterials}
      />

      {/* 7. Material Request Print & Export Modal */}
      <MaterialRequestPrintModal
        isOpen={isMaterialRequestPrintModalOpen}
        onClose={() => {
          setIsMaterialRequestPrintModalOpen(false);
          setPrintingMaterialRequest(null);
        }}
        request={printingMaterialRequest}
      />

      {/* 8. Master Material Create/Edit Modal */}
      <MasterMaterialModal
        isOpen={isMasterMaterialModalOpen}
        onClose={() => {
          setIsMasterMaterialModalOpen(false);
          setEditingMasterMaterial(null);
        }}
        onSave={handleSaveMasterMaterial}
        itemToEdit={editingMasterMaterial}
        defaultCategory={defaultCategoryForMasterModal}
      />

      {/* 9. Material Shipment Create/Edit Modal */}
      <MaterialShipmentModal
        isOpen={isMaterialShipmentModalOpen}
        onClose={() => {
          setIsMaterialShipmentModalOpen(false);
          setEditingMaterialShipment(null);
        }}
        onSave={handleSaveMaterialShipment}
        shipmentToEdit={editingMaterialShipment}
        projects={projects}
        masterMaterials={masterMaterials}
      />

      {/* 10. Material Shipment Print & Surat Jalan Modal */}
      <MaterialShipmentPrintModal
        isOpen={isMaterialShipmentPrintModalOpen}
        onClose={() => {
          setIsMaterialShipmentPrintModalOpen(false);
          setPrintingMaterialShipment(null);
        }}
        shipment={printingMaterialShipment}
      />

      {/* 11. Foreman Create/Edit Modal (Multi-Lokasi & PIC) */}
      <ForemanModal
        isOpen={isForemanModalOpen}
        onClose={() => {
          setIsForemanModalOpen(false);
          setEditingForeman(null);
        }}
        onSave={handleSaveForeman}
        foremanToEdit={editingForeman}
        projects={projects}
      />

      {/* 12. Work Plan Create/Edit Modal (Rencana Kerja Lapangan) */}
      <WorkPlanModal
        isOpen={isWorkPlanModalOpen}
        onClose={() => {
          setIsWorkPlanModalOpen(false);
          setEditingWorkPlan(null);
        }}
        onSave={handleSaveWorkPlan}
        planToEdit={editingWorkPlan}
        projects={projects}
        foremen={foremen}
      />

      {/* 13. Work Plan Print & Export Modal */}
      <WorkPlanPrintModal
        isOpen={isWorkPlanPrintModalOpen}
        onClose={() => {
          setIsWorkPlanPrintModalOpen(false);
          setPrintingWorkPlan(null);
        }}
        plan={printingWorkPlan}
      />

      {/* 14. Universal Confirmation Modal (Iframe-safe) */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        itemDetail={confirmDialog.itemDetail}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-700">Divisi Mechanical Electrical PT Sapta Manunggal Karya</span>
            <span className="text-slate-300">&bull;</span>
            <span>Standar SPBJ, K3 &amp; Manpower Lapangan</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Keselamatan Ketenagalistrikan (K2 / K3 Listrik)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
