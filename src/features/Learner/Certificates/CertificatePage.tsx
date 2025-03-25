import React, { useState } from 'react';
import { 
  Award,
  Search,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import { CertificateCard } from './components/CertificateCard';
import { ExternalCertificateCard } from './components/ExternalCertificateCard';
import { CertificateFormModal } from './components/CertificateFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { SuccessNotification } from './components/SuccessNotification';
import { Certificate, ExternalCertificate } from './types/certificates';
import { mockCertificates } from './data/certificatesData';

const CertificatesPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<ExternalCertificate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [externalCertificates, setExternalCertificates] = useState<ExternalCertificate[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<number | null>(null);

  // Sample certificates data
  const certificates: Certificate[] = mockCertificates;

  const handleAddExternalCertificate = (cert: Omit<ExternalCertificate, 'id'> & { id?: number }) => {
    if (cert.id) {
      // Edit existing certificate
      const updatedCertificates = externalCertificates.map(existing => 
        existing.id === cert.id ? { ...cert, id: existing.id } as ExternalCertificate : existing
      );
      setExternalCertificates(updatedCertificates);
      setSuccessMessage("Certificate updated successfully!");
    } else {
      // Add new certificate
      const newCertificate = {
        ...cert,
        id: Date.now()
      } as ExternalCertificate;
      setExternalCertificates([...externalCertificates, newCertificate]);
      setSuccessMessage("External certificate added successfully!");
    }
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEditCertificate = (cert: ExternalCertificate) => {
    setCurrentCertificate(cert);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteCertificate = (id: number) => {
    setCertificateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCertificate = () => {
    if (certificateToDelete) {
      const updatedCertificates = externalCertificates.filter(cert => 
        cert.id !== certificateToDelete
      );
      setExternalCertificates(updatedCertificates);
      setSuccessMessage("Certificate deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleOpenModal = () => {
    setCurrentCertificate(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filter !== 'all' && cert.status.toLowerCase() !== filter) return false;
    if (searchQuery && !cert.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-3xl md:text-4xl text-center font-bold bg-white via-white bg-clip-text text-transparent">
              Certificates
            </h1>
            <p className="text-[#D68BF9] text-center mt-1">Track your learning achievements</p>
          </div>

          {showSuccess && (
            <SuccessNotification message={successMessage} />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { 
                icon: Award, 
                label: 'Total Certificates', 
                value: (certificates.length + externalCertificates.length).toString(),
                color: 'from-[#BF4BF6] to-[#7A00B8]'
              },
              { 
                icon: Clock, 
                label: 'In Progress', 
                value: certificates.filter(c => c.status === 'In Progress').length.toString(),
                color: 'from-[#D68BF9] to-[#BF4BF6]'
              },
              { 
                icon: CheckCircle2, 
                label: 'Completed This Month', 
                value: '1',
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
                  className="flex-1 border-none focus:ring-0 text-gray-600 placeholder-gray-400"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[#1B0A3F]"
              >
                <option value="all">All Certificates</option>
                <option value="completed">Completed</option>
                <option value="in progress">In Progress</option>
              </select>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg 
                               hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-['Nunito_Sans']"
              >
                <Plus className="h-5 w-5" />
                Add External Certificate
              </button>
            </div>
          </div>

          {/* Internal Certificates Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Internal Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map(certificate => (
                <CertificateCard 
                  key={certificate.id} 
                  certificate={certificate}
                />
              ))}
            </div>
          </div>

          {/* External Certificates Section */}
          {externalCertificates.length > 0 && filter !== 'in progress' && (
            <div className="space-y-8 mt-12">
              <h2 className="text-2xl font-semibold text-white">External Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {externalCertificates
                  .filter(cert => 
                    searchQuery ? cert.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
                  )
                  .map(certificate => (
                    <ExternalCertificateCard 
                      key={certificate.id} 
                      certificate={certificate}
                      onEdit={handleEditCertificate}
                      onDelete={handleDeleteCertificate}
                    />
                  ))
                }
              </div>
            </div>
          )}

          {/* Add/Edit Certificate Modal */}
          <CertificateFormModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddExternalCertificate}
            initialData={currentCertificate || {
              title: '',
              issuer: '',
              completionDate: '',
              url: '',
              platform: 'LinkedIn'
            }}
            isEditing={isEditMode}
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