import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getGlobalAnalytics,
  getAllColleges
} from '@/api/admin';

import GlobalAnalyticsCard from '@/components/superadmin/GlobalAnalyticsCard';
import CreateCollegeForm from '@/components/superadmin/CreateCollegeForm';
import AssignManagerForm from '@/components/superadmin/AssignManagerForm';
import ManageCollegesTable from '@/components/superadmin/ManageCollegesTable';

interface College {
  _id: string;
  name: string;
  isActive: boolean;
}

interface AnalyticsData {
  totalColleges: number;
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalMaterials: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  aiUsage: {
    totalQueries: number;
    totalEmbeddings: number;
  };
}

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [collegeName, setCollegeName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ================= FETCH DATA =================

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([fetchColleges(), fetchAnalytics()]);
  };

  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);
      const response = await getAllColleges();

      console.log("Colleges API:", response);

      const data = response?.data?.data || response?.data || [];
      setColleges(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to fetch colleges');
      setColleges([]);
    } finally {
      setLoadingColleges(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await getGlobalAnalytics();

      console.log("Analytics API:", response);

      const data = response?.data?.data || response?.data || null;
      setAnalytics(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // ================= HANDLERS =================

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collegeName.trim()) {
      toast.error("College name required");
      return;
    }

    try {
      setLoading(true);
      const response = await createCollege(collegeName);

      toast.success(response?.data?.message || "College created");
      setCollegeName('');
      fetchInitialData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCollegeId || !managerEmail.trim()) {
      toast.error("All fields required");
      return;
    }

    try {
      setLoading(true);
      const response = await assignManager(selectedCollegeId, managerEmail);

      toast.success(response?.data?.message || "Manager assigned");
      setManagerEmail('');
      setSelectedCollegeId('');
      fetchAnalytics();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Assign failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollegeStatus = async (collegeId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const response = await activateDeactivateCollege(collegeId, !currentStatus);

      toast.success(response?.data?.message || "Updated successfully");
      fetchInitialData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ================= UI SAFETY =================

  if (!user) {
    return <div className="text-center mt-10 text-red-500">Unauthorized</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Super Admin Dashboard
      </h1>

      <GlobalAnalyticsCard
        analytics={analytics}
        loadingAnalytics={loadingAnalytics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CreateCollegeForm
          collegeName={collegeName}
          setCollegeName={setCollegeName}
          handleCreateCollege={handleCreateCollege}
          loading={loading}
        />

        <AssignManagerForm
          managerEmail={managerEmail}
          setManagerEmail={setManagerEmail}
          selectedCollegeId={selectedCollegeId}
          setSelectedCollegeId={setSelectedCollegeId}
          colleges={colleges}
          handleAssignManager={handleAssignManager}
          loading={loading}
          loadingColleges={loadingColleges}
        />
      </div>

      <ManageCollegesTable
        colleges={colleges}
        loadingColleges={loadingColleges}
        handleToggleCollegeStatus={handleToggleCollegeStatus}
        loading={loading}
      />
    </div>
  );
};

export default SuperAdminDashboard;
