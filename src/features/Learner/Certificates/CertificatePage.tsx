// src/features/Learner/Certificates/CertificatePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Award,
  Search,
  Clock,
  CheckCircle2,
  Plus,
  X,
  AlertCircle // Added for error display
} from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { CertificateCard } from './components/CertificateCard'; // This will handle backend CertificateDto
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'; // For deleting *internal* certificates
import { SuccessNotification } from './components/SuccessNotification'; // Re-use for success toasts
import { CertificateDto, LearnerCourseDto } from '../../../types/course.types'; // Use backend DTOs
import { getUserCertificates, generateCertificate } from '../../../api/services/Course/certificateService'; // New API service
import { getEnrolledCoursesForLearner } from '../../../api/services/Course/learnerCourseService'; // To get courses for generation dropdown
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';


// New Modal for generating internal certificates
interface GenerateCertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    enrolledCourses: LearnerCourseDto[];
    onGenerate: (courseId: number) => void;
    isGenerating: boolean;
}

const GenerateCertificateModal: React.FC<GenerateCertificateModalProps> = ({
    isOpen,
    onClose,
    enrolledCourses,
    onGenerate,
    isGenerating
}) => {
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && enrolledCourses.length > 0) {
            // Find the first 100% completed course that doesn't already have a certificate
            const completedCoursesWithoutCert = enrolledCourses.filter(course => 
                course.progressPercentage === 100 && course.enrollmentStatus === 'active' && // Check enrollment status
                (!(course as LearnerCourseDto & { certificateFileUrl?: string | null }).certificateFileUrl) // FIX: Added type assertion
            );
            if (completedCoursesWithoutCert.length > 0) {
                setSelectedCourseId(completedCoursesWithoutCert[0].id);
            } else {
                setSelectedCourseId(null);
            }
        }
    }, [isOpen, enrolledCourses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourseId) {
            onGenerate(selectedCourseId);
        } else {
            toast.error("Please select a course to generate a certificate.");
        }
    };

    if (!isOpen) return null;

    const completableCourses = enrolledCourses.filter(c => 
      c.progressPercentage === 100 && c.enrollmentStatus === 'active'
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-nunito">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-xl p-6 w-full max-w-md z-10 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#1B0A3F]">Generate New Certificate</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Completed Course</label>
                        {completableCourses.length > 0 ? (
                            <select
                                id="courseSelect"
                                className="w-full border rounded-lg p-2 bg-gray-50 text-gray-800"
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(parseInt(e.target.value, 10))}
                                disabled={isGenerating}
                            >
                                <option value="" disabled>Select a course...</option>
                                {completableCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-gray-600">No courses available for certificate generation. Complete a course (100% progress) first.</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg py-2
                                  hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 disabled:opacity-50"
                        disabled={isGenerating || !selectedCourseId}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Certificate'}
                    </button>
                </form>
            </div>
        </div>
    );
};


const CertificatesPage = () => {
  const { user } = useAuth(); // Access user info
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalCertificates, setInternalCertificates] = useState<CertificateDto[]>([]); // Backend certificates
  const [enrolledCourses, setEnrolledCourses] = useState<LearnerCourseDto[]>([]); // To populate course dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // This state will now be used

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false); // For new generate modal
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Delete functionality for internal certificates (if allowed by backend)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certificateToDeleteId, setCertificateToDeleteId] = useState<number | null>(null);


  const fetchCertificatesAndCourses = useCallback(async () => {
    if (!user?.id) {
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const [certs, courses] = await Promise.all([
            getUserCertificates(),
            getEnrolledCoursesForLearner()
        ]);
        setInternalCertificates(certs);
        setEnrolledCourses(courses);
    } catch (err) {
        console.error("Failed to fetch certificates or courses:", err);
        setError("Failed to load certificates or course data."); // Sets error state
        toast.error("Failed to load certificates.");
    } finally {
        setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCertificatesAndCourses();
  }, [fetchCertificatesAndCourses]);


  const handleGenerateCertificate = async (courseId: number) => {
    setIsGeneratingCertificate(true);
    const generateToastId = toast.loading("Generating certificate...");
    try {
        const generatedCert = await generateCertificate(courseId);
        toast.success(`Certificate for "${generatedCert.courseTitle}" generated!`, { id: generateToastId });
        setIsGenerateModalOpen(false);
        // Refresh certificates list
        await fetchCertificatesAndCourses();
    } catch (err: any) {
        console.error("Certificate generation failed:", err);
        toast.error(err.response?.data?.message || "Failed to generate certificate.", { id: generateToastId });
    } finally {
        setIsGeneratingCertificate(false);
    }
  };


  const handleDeleteCertificateConfirmation = (certificateId: number) => {
    setCertificateToDeleteId(certificateId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCertificate = async () => {
    if (!certificateToDeleteId) return;

    // Certificates are typically not deletable once issued.
    // If your backend implements deletion for some reason, call it here.
    // For now, it's a visual removal placeholder.
    toast.error("Deleting certificates is not supported by the backend (usually).");
    setInternalCertificates(prev => prev.filter(cert => cert.id !== certificateToDeleteId));
    setSuccessMessage("Certificate marked as deleted (visual only)."); // For testing UI
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    setIsDeleteModalOpen(false);
    setCertificateToDeleteId(null);
  };


  const filteredCertificates = internalCertificates.filter(cert => {
    // Filter based on status (e.g., 'Completed' will always be the status for generated certificates)
    // NOTE: Backend generated certificates always have a completionDate.
    // The "In Progress" filter on frontend will only work if there are *external* certificates
    // with "In Progress" status, which are not currently fetched/managed via backend.
    const isCompleted = !!cert.completionDate; // Assuming presence of completionDate means completed

    if (filter === 'completed' && !isCompleted) return false;
    if (filter === 'in progress' && isCompleted) return false; // Hide completed if "In Progress" filter

    if (searchQuery && !cert.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false; // Search by cert title or course title
    return true;
  });

  const totalCertificates = internalCertificates.length; // Count only internal certificates

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-3xl md:text-4xl text-center font-bold bg-white via-white bg-clip-text text-transparent">
              My Certificates
            </h1>
            <p className="text-[#D68BF9] text-center mt-1">Track your learning achievements</p>
          </div>

          {showSuccess && (
            <SuccessNotification message={successMessage} />
          )}

          {/* FIX: Display error message if 'error' state is set */}
          {error && !loading && ( // Show error only if not loading to avoid flicker
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-center gap-3" role="alert">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { 
                icon: Award, 
                label: 'Total Certificates', 
                value: totalCertificates.toString(),
                color: 'from-[#BF4BF6] to-[#7A00B8]'
              },
              { 
                icon: Clock, 
                label: 'Courses In Progress', // Changed label
                value: enrolledCourses.filter(c => c.enrollmentStatus === 'active' && c.progressPercentage < 100).length.toString(),
                color: 'from-[#D68BF9] to-[#BF4BF6]'
              },
              { 
                icon: CheckCircle2, 
                label: 'Courses Completed', // Changed label
                value: enrolledCourses.filter(c => c.enrollmentStatus === 'active' && c.progressPercentage === 100).length.toString(),
                color: 'from-[#7A00B8] to-[#52007C]'
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:border-[#BF4BF6]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#52007C] font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1B0A3F] mt-1">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Add Certificate Button */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none focus:ring-0 text-gray-600 placeholder-gray-400 font-nunito"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[#1B0A3F] font-nunito"
              >
                <option value="all">All Certificates</option>
                <option value="completed">Completed</option>
                <option value="in progress">In Progress</option> {/* Placeholder for UI filter, actual generated certs are 'completed' */}
              </select>
              <button
                onClick={() => setIsGenerateModalOpen(true)} // Open new modal
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg 
                               hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito disabled:opacity-50"
                disabled={loading || !user?.id} // Disable if not logged in or loading
              >
                <Plus className="h-5 w-5" />
                Generate New Certificate
              </button>
            </div>
          </div>

          {/* Earned Certificates Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Earned Certificates</h2>
            {loading && internalCertificates.length === 0 && !error ? ( // Show loader only if no error
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                </div>
            ) : !loading && !error && filteredCertificates.length === 0 ? ( // Show no certificates message if not loading and no error
                <p className="text-gray-300 text-center py-8">No certificates earned yet. Complete courses to earn them!</p>
            ) : filteredCertificates.length > 0 ? ( // Show certificates if they exist
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map(certificate => (
                    <CertificateCard 
                    key={certificate.id} 
                    certificate={certificate}
                    onDelete={() => handleDeleteCertificateConfirmation(certificate.id)} // Pass for deletion (if backend supports)
                    />
                ))}
                </div>
            ) : null}
            {/* If loading is true and there's an error, the error message above will be displayed */}
            {/* If loading is false, and there's an error, and no certs, the error message above will be displayed */}
          </div>

          {/* Generate Certificate Modal */}
          <GenerateCertificateModal
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            enrolledCourses={enrolledCourses}
            onGenerate={handleGenerateCertificate}
            isGenerating={isGeneratingCertificate}
          />

          {/* Delete Confirmation Modal (for internal certificates) */}
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