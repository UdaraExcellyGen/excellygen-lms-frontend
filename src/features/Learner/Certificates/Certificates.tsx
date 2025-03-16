import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Award,
    Download,
    Search,
    Star,
    Clock,
    CheckCircle2,
    Plus,
    ExternalLink,
    X,
    Edit,
    Trash2
} from 'lucide-react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout'; 
import { Certificate, ExternalCertificate } from '../Certificates/types/certificate';
import { certificates as initialCertificates } from '../Certificates/data/certificates';


const SuccessNotification = ({ message }: { message: string }) => (
    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
        <span className="block sm:inline">{message}</span>
    </div>
);

interface CertificateCardProps {
    certificate: Certificate;
}

interface ExternalCertificateCardProps {
    certificate: ExternalCertificate;
    onEdit: (cert: ExternalCertificate) => void;
    onDelete: (id: number) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-50 text-green-600';
            case 'In Progress':
                return 'bg-blue-50 text-blue-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (certificate.status === 'Completed') {
            
            navigate(`/certificate/${certificate.id}`); 
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-[#52007C] to-[#BF4BF6] p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Award className="h-20 w-20 text-white/20" />
                </div>
                <div className="relative">
                    <h3 className="text-lg font-semibold text-white">{certificate.title}</h3>
                    <p className="text-[#D68BF9] mt-1">{certificate.issuer}</p>
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(certificate.status)}`}>
                            {certificate.status}
                        </span>
                        {certificate.grade && (
                            <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium">{certificate.grade}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {certificate.status === 'Completed' && (
                            <button
                                className="p-2 text-gray-500 hover:text-[#BF4BF6] rounded-lg transition-colors"
                                onClick={handleDownload}
                                aria-label="Download certificate"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {certificate.status === 'Completed' ? (
                            <span>Completed on {certificate.completionDate}</span>
                        ) : (
                            <span>Expected completion: {certificate.expectedCompletion}</span>
                        )}
                    </div>
                    {certificate.skills && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {certificate.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-[#F6E6FF] text-[#52007C] text-xs rounded-lg"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExternalCertificateCard = ({ certificate, onEdit, onDelete }: ExternalCertificateCardProps) => {
    const navigate = useNavigate();

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        e.preventDefault();
        
        navigate(`/certificate/external-${certificate.id}`); 
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-[#1A237E] to-[#3949AB] p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <ExternalLink className="h-20 w-20 text-white/20" />
                </div>
                <div className="relative">
                    <h3 className="text-lg font-semibold text-white">{certificate.title}</h3>
                    <p className="text-blue-200 mt-1">{certificate.issuer}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {certificate.platform}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                        onClick={() => onEdit(certificate)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        aria-label="Edit certificate"
                    >
                        <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                        onClick={() => onDelete(certificate.id)}
                        className="p-1.5 bg-white/20 hover:bg-red-400/30 rounded-full transition-colors"
                        aria-label="Delete certificate"
                    >
                        <Trash2 className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Completed on {certificate.completionDate}</span>
                    </div>
                    <div className="flex space-x-2">
                        <a
                            href={certificate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </a>
                        <button
                            onClick={handleDownload}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                            aria-label="Download certificate"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CertificateFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = {
        title: '',
        issuer: '',
        completionDate: '',
        url: '',
        platform: 'LinkedIn'
    },
    isEditing = false
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (cert: Omit<ExternalCertificate, 'id'> & { id?: number }) => void;
    initialData?: Omit<ExternalCertificate, 'id'> & { id?: number };
    isEditing?: boolean;
}) => {
    const [formData, setFormData] = useState(initialData);
    const [showCustomPlatform, setShowCustomPlatform] = useState(initialData.platform !== 'LinkedIn' &&
        initialData.platform !== 'Coursera' &&
        initialData.platform !== 'Udemy');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setShowCustomPlatform(value === 'Other');

        if (value !== 'Other') {
            setFormData({ ...formData, platform: value });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-xl p-6 w-full max-w-md z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                        {isEditing ? 'Edit External Certificate' : 'Add External Certificate'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full border rounded-lg p-2"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                        <input
                            type="text"
                            required
                            className="w-full border rounded-lg p-2"
                            value={formData.issuer}
                            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={showCustomPlatform ? 'Other' : formData.platform}
                            onChange={handlePlatformChange}
                        >
                            <option>LinkedIn</option>
                            <option>Coursera</option>
                            <option>Udemy</option>
                            <option>Other</option>
                        </select>
                    </div>

                    {/* Custom platform input field */}
                    {showCustomPlatform && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Platform</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded-lg p-2"
                                value={formData.platform === 'LinkedIn' ||
                                    formData.platform === 'Coursera' ||
                                    formData.platform === 'Udemy' ? '' : formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                placeholder="Enter platform name"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                        <input
                            type="date"
                            required
                            className="w-full border rounded-lg p-2"
                            value={formData.completionDate}
                            onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
                        <input
                            type="url"
                            required
                            className="w-full border rounded-lg p-2"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg py-2
                      hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300"
                        >
                        {isEditing ? 'Save Changes' : 'Add Certificate'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-xl p-6 w-full max-w-md z-10">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold">Delete Certificate</h3>
                    <p className="text-gray-600 mt-2">Are you sure you want to delete this certificate? This action cannot be undone.</p>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const Certificates = () => {
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

    const certificates: Certificate[] = initialCertificates;

    const handleAddExternalCertificate = (cert: Omit<ExternalCertificate, 'id'> & { id?: number }) => {
        if (cert.id) {
            const updatedCertificates = externalCertificates.map(existing =>
                existing.id === cert.id ? { ...cert, id: existing.id } as ExternalCertificate : existing
            );
            setExternalCertificates(updatedCertificates);
            setSuccessMessage("Certificate updated successfully!");
        } else {
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
            <div className="max-w-7xl mx-auto px-8 space-y-8">
                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-3xl md:text-4xl text-center font-bold bg-gradient-to-r from-white via-white bg-clip-text text-transparent">
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
        </Layout>
    );
};

export default Certificates;