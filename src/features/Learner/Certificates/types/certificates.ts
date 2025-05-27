export interface Certificate {
    id: number;
    title: string;
    issuer: string;
    status: 'Completed' | 'In Progress';
    completionDate?: string;
    expectedCompletion?: string;
    grade?: string;
    skills?: string[];
    progress?: number;
  }
  
  export interface ExternalCertificate {
    id: number;
    title: string;
    issuer: string;
    completionDate: string;
    url: string;
    platform: string;
  }
  
  export interface CertificateCardProps {
    certificate: Certificate;
  }
  
  export interface ExternalCertificateCardProps {
    certificate: ExternalCertificate;
    onEdit: (cert: ExternalCertificate) => void;
    onDelete: (id: number) => void;
  }
  
  export interface CertificateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (cert: Omit<ExternalCertificate, 'id'> & { id?: number }) => void;
    initialData?: Omit<ExternalCertificate, 'id'> & { id?: number };
    isEditing?: boolean;
  }
  
  export interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }
  
  export interface SuccessNotificationProps {
    message: string;
  }