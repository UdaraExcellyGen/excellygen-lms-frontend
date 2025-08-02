// src/features/Learner/Certificates/CertificatePage.tsx - Updated for Full-Page Certificate Viewer
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Award,
  Search,
  Clock,
  CheckCircle2,
  Plus,
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { CertificateCard } from './components/CertificateCard';
import { ExternalCertificateCard } from './components/ExternalCertificateCard';
import { CertificateFormModal } from './components/CertificateFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { SuccessNotification } from './components/SuccessNotification';
import CertificateViewer from './CertificateViewer';

import { 
  CertificateDto, 
  ExternalCertificateDto, 
  CombinedCertificateDto,
  LearnerCourseDto,
  ExternalCertificateFormData,
  BRAND_COLORS
} from '../../../types/course.types';

import { 
  getAllCertificates,
  addExternalCertificate,
  updateExternalCertificate,
  deleteExternalCertificate
} from '../../../api/services/Course/certificateService';
import { getEnrolledCoursesForLearner } from '../../../api/services/Course/learnerCourseService';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CertificatesPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('all'); // 'all', 'internal', 'external'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allCertificates, setAllCertificates] = useState<CombinedCertificateDto[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<LearnerCourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isExternalFormModalOpen, setIsExternalFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certificateToDeleteId, setCertificateToDeleteId] = useState<string | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<ExternalCertificateDto | null>(null);
  
  // Certificate viewer state - Updated for full-page view
  const [viewingCertificate, setViewingCertificate] = useState<CombinedCertificateDto | null>(null);
  const [showCertificateViewer, setShowCertificateViewer] = useState(false);

  // Success notification
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCertificatesAndCourses = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [certs, courses] = await Promise.all([
        getAllCertificates(),
        getEnrolledCoursesForLearner()
      ]);
      setAllCertificates(certs);
      setEnrolledCourses(courses);
    } catch (err) {
      console.error("Failed to fetch certificates or courses:", err);
      setError("Failed to load certificates or course data.");
      toast.error("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCertificatesAndCourses();
  }, [fetchCertificatesAndCourses]);

  const handleAddExternalCertificate = async (formData: ExternalCertificateFormData) => {
    const loadingToastId = toast.loading("Adding external certificate...");
    try {
      await addExternalCertificate(formData);
      toast.success("External certificate added successfully!", { id: loadingToastId });
      setIsExternalFormModalOpen(false);
      setEditingCertificate(null);
      await fetchCertificatesAndCourses();
    } catch (err: any) {
      console.error("Failed to add external certificate:", err);
      toast.error(err.response?.data?.message || "Failed to add external certificate.", { id: loadingToastId });
    }
  };

  const handleUpdateExternalCertificate = async (formData: ExternalCertificateFormData) => {
    if (!editingCertificate) return;
    
    const loadingToastId = toast.loading("Updating external certificate...");
    try {
      await updateExternalCertificate(editingCertificate.id, formData);
      toast.success("External certificate updated successfully!", { id: loadingToastId });
      setIsExternalFormModalOpen(false);
      setEditingCertificate(null);
      await fetchCertificatesAndCourses();
    } catch (err: any) {
      console.error("Failed to update external certificate:", err);
      toast.error(err.response?.data?.message || "Failed to update external certificate.", { id: loadingToastId });
    }
  };

  const handleEditExternalCertificate = (certificate: ExternalCertificateDto) => {
    setEditingCertificate(certificate);
    setIsExternalFormModalOpen(true);
  };

  const handleDeleteCertificateConfirmation = (certificateId: string) => {
    setCertificateToDeleteId(certificateId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCertificate = async () => {
    if (!certificateToDeleteId) return;

    const loadingToastId = toast.loading("Deleting certificate...");
    try {
      await deleteExternalCertificate(certificateToDeleteId);
      toast.success("External certificate deleted successfully!", { id: loadingToastId });
      await fetchCertificatesAndCourses();
    } catch (err: any) {
      console.error("Failed to delete external certificate:", err);
      toast.error(err.response?.data?.message || "Failed to delete external certificate.", { id: loadingToastId });
    } finally {
      setIsDeleteModalOpen(false);
      setCertificateToDeleteId(null);
    }
  };

  const handleViewCertificate = (certificate: CombinedCertificateDto) => {
    setViewingCertificate(certificate);
    setShowCertificateViewer(true);
  };

  const handleBackFromCertificateViewer = () => {
    setShowCertificateViewer(false);
    setViewingCertificate(null);
  };

  const filteredCertificates = allCertificates.filter(cert => {
    // Filter by type
    if (filter === 'internal' && cert.type !== 'internal') return false;
    if (filter === 'external' && cert.type !== 'external') return false;

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const title = cert.type === 'internal' ? cert.courseTitle : cert.title;
      const issuer = cert.type === 'internal' ? 'ExcellyGen LMS' : cert.issuer;
      
      if (!title.toLowerCase().includes(searchLower) && 
          !issuer.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  // Statistics
  const totalCertificates = allCertificates.length;
  const internalCertificates = allCertificates.filter(cert => cert.type === 'internal').length;
  const externalCertificates = allCertificates.filter(cert => cert.type === 'external').length;
  const completedCourses = enrolledCourses.filter(c => c.enrollmentStatus === 'active' && c.progressPercentage === 100).length;
  const coursesInProgress = enrolledCourses.filter(c => c.enrollmentStatus === 'active' && c.progressPercentage < 100).length;

  // Show certificate viewer as full page
  if (showCertificateViewer && viewingCertificate) {
    return (
      <CertificateViewer
        certificate={viewingCertificate}
        onBack={handleBackFromCertificateViewer}
      />
    );
  }

  const stats = [
    { 
      icon: Award, 
      label: 'Total Certificates', 
      value: totalCertificates.toString(),
      gradient: 'from-phlox to-french-violet'
    },
    { 
      icon: CheckCircle2, 
      label: 'Internal Certificates', 
      value: internalCertificates.toString(),
      gradient: 'from-heliotrope to-phlox'
    },
    { 
      icon: ExternalLink, 
      label: 'External Certificates', 
      value: externalCertificates.toString(),
      gradient: 'from-federal-blue to-indigo'
    },
    { 
      icon: Clock, 
      label: 'Courses In Progress', 
      value: coursesInProgress.toString(),
      gradient: 'from-french-violet to-indigo'
    }
  ];

  return (
    <Layout>
      <div 
        className="min-h-screen p-6"
        style={{ 
          background: `linear-gradient(to bottom, ${BRAND_COLORS.indigo}, ${BRAND_COLORS.persianIndigo})` 
        }}
      >
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              My Certificates
            </h1>
            <p className="text-base text-[#D68BF9] mt-2">
              Track your learning achievements from all platforms
            </p>
          </div>

          {showSuccess && (
            <SuccessNotification message={successMessage} />
          )}

          {/* Error display */}
          {error && !loading && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-center gap-3 font-nunito" role="alert">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
              <button 
                onClick={fetchCertificatesAndCourses} 
                className="ml-auto px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:shadow-xl transition-all duration-300 font-nunito"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#52007C] text-sm uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1 text-[#1B0A3F]">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Add External Certificate Button */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md mb-8 font-nunito">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#52007C]" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl pl-12 pr-4 py-3 text-[#1B0A3F] placeholder-[#52007C]/60 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl px-4 py-3 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
                >
                  <option value="all">All Certificates</option>
                  <option value="internal">Internal Certificates</option>
                  <option value="external">External Certificates</option>
                </select>
                <button
                  onClick={() => {
                    setEditingCertificate(null);
                    setIsExternalFormModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-white rounded-xl transition-all duration-300 disabled:opacity-50 bg-gradient-to-r from-[#03045e] to-[#0609C6] hover:from-[#0609C6] hover:to-[#03045e]"
                  disabled={loading || !user?.id}
                >
                  <Plus className="h-5 w-5" />
                  Add External Certificate
                </button>
              </div>
            </div>
          </div>

          {/* Certificates Section */}
          <div className="space-y-8">
            
            {loading && allCertificates.length === 0 && !error ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : !loading && !error && filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-2 font-nunito">No certificates found</p>
                <p className="text-gray-400 font-nunito">
                  {filter === 'external' 
                    ? 'Add external certificates from other platforms'
                    : filter === 'internal' 
                    ? 'Complete courses to earn internal certificates'
                    : 'Start learning to earn your first certificate!'}
                </p>
              </div>
            ) : filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map(certificate => (
                  certificate.type === 'internal' ? (
                    <CertificateCard 
                      key={`internal-${certificate.id}`}
                      certificate={certificate as CertificateDto}
                      onDelete={() => {}} // Internal certificates typically can't be deleted
                      onView={() => handleViewCertificate(certificate)}
                    />
                  ) : (
                    <ExternalCertificateCard 
                      key={`external-${certificate.id}`}
                      certificate={certificate as ExternalCertificateDto}
                      onEdit={handleEditExternalCertificate}
                      onDelete={handleDeleteCertificateConfirmation}
                      onView={() => handleViewCertificate(certificate)}
                    />
                  )
                ))}
              </div>
            ) : null}
          </div>

          {/* External Certificate Form Modal */}
          <CertificateFormModal
            isOpen={isExternalFormModalOpen}
            onClose={() => {
              setIsExternalFormModalOpen(false);
              setEditingCertificate(null);
            }}
            onSubmit={editingCertificate ? handleUpdateExternalCertificate : handleAddExternalCertificate}
            initialData={editingCertificate ? {
              title: editingCertificate.title,
              issuer: editingCertificate.issuer,
              platform: editingCertificate.platform,
              completionDate: editingCertificate.completionDate,
              credentialUrl: editingCertificate.credentialUrl || '',
              credentialId: editingCertificate.credentialId || '',
              description: editingCertificate.description || ''
            } : undefined}
            isEditing={!!editingCertificate}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeleteCertificate}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CertificatesPage;