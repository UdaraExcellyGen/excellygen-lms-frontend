// src/pages/DiscussionForum/components/CreateThreadModal.tsx
import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { ThreadFormData } from '../types/dto'; // <--- CORRECTED IMPORT PATH
import { uploadForumImage, deleteUploadedFile, isAxiosError as isFileAxiosError } from '../../../../api/fileApi'; // Adjust path if api/ is elsewhere
import { toast } from 'react-hot-toast';

// ... (Rest of the CreateThreadModal.tsx code from modal_25, no other logical changes needed here if import is correct)
interface CreateThreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ThreadFormData) => Promise<void>; 
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    const [currentUploadedImageUrl, setCurrentUploadedImageUrl] = useState<string | undefined>(undefined); 
    const [currentUploadedRelativePath, setCurrentUploadedRelativePath] = useState<string | undefined>(undefined); 

    const [isUploadingImage, setIsUploadingImage] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    const fileInputRef = useRef<HTMLInputElement>(null);
    const categories = [ 'Software Engineering', 'Quality Assurance', 'Project Management', 'DevOps', 'UI/UX Design', 'Data Science', 'Cloud Computing', 'Cyber Security'];

    const resetFormState = () => {
        setTitle(''); setCategory(''); setContent('');
        setImageFile(null); setImagePreview(undefined);
        setCurrentUploadedImageUrl(undefined); setCurrentUploadedRelativePath(undefined);
        setIsUploadingImage(false); setIsSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleModalClose = async () => {
        if (currentUploadedRelativePath) {
            try {
                console.log("Modal closed with pending uploaded image, deleting:", currentUploadedRelativePath);
                await deleteUploadedFile(currentUploadedRelativePath);
            } catch (err) {
                console.error("Error deleting unsaved uploaded image on modal close:", err);
            }
        }
        resetFormState();
        onClose();
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (currentUploadedRelativePath) { // If an image was already uploaded in THIS session for this modal
             deleteUploadedFile(currentUploadedRelativePath).catch(err=>console.error("Pre-emptive delete failed", err));
             setCurrentUploadedImageUrl(undefined);
             setCurrentUploadedRelativePath(undefined);
        }

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(undefined);
        }
    };

    const handleRemoveImage = async () => {
        if (currentUploadedRelativePath) { // Image was previously uploaded to server
            setIsUploadingImage(true); 
            try {
                await deleteUploadedFile(currentUploadedRelativePath);
                toast.success("Uploaded image removed.");
            } catch (err: any) {
                const errorMsg = isFileAxiosError(err) && err.response?.data?.message ? err.response.data.message : "Could not remove uploaded image.";
                toast.error(errorMsg);
            } finally {
                setIsUploadingImage(false);
            }
        }
        // Clear local state regardless of server deletion success
        setImageFile(null);
        setImagePreview(undefined);
        setCurrentUploadedImageUrl(undefined);
        setCurrentUploadedRelativePath(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let finalImageUrlForParent = currentUploadedImageUrl; // Assume already uploaded
        let finalRelativePathForParent = currentUploadedRelativePath;

        if (imageFile && !currentUploadedImageUrl) { // New image file selected, and no image has been successfully uploaded yet for this modal session
            setIsUploadingImage(true); 
            try {
                const uploadData = await uploadForumImage(imageFile);
                finalImageUrlForParent = uploadData.imageUrl; 
                finalRelativePathForParent = uploadData.relativePath;
                // Keep these in state in case parent submit fails, so we don't re-upload
                setCurrentUploadedImageUrl(finalImageUrlForParent);
                setCurrentUploadedRelativePath(finalRelativePathForParent);
                toast.success("Image uploaded!");
            } catch (err: any) {
                setIsUploadingImage(false);
                setIsSubmitting(false);
                const errorMsg = isFileAxiosError(err) && err.response?.data?.message ? err.response.data.message : "Image upload failed.";
                toast.error(errorMsg);
                return; 
            }
            setIsUploadingImage(false);
        }
        
        const formDataForParent: ThreadFormData = { 
            title, content, category, 
            image: null, 
            imagePreview, // Could be useful for parent to know if a preview was set
            imageUrl: finalImageUrlForParent, // The final URL (full)
            currentRelativePath: finalRelativePathForParent // Pass relative path
        };

        try {
            await onSubmit(formDataForParent); 
            // Assuming parent calls onClose and might reset form state through prop change
            // If onSubmit in parent is successful, modal closes, this specific instance data will be gone.
            // If parent's onSubmit failed, we want to keep the state including uploaded image info.
        } catch (submitError) {
            console.error("Error during parent thread submission:", submitError);
            // If submit to parent failed, and we just uploaded an image for *this* attempt,
            // we might offer to delete it, or let it be (could be orphaned on server).
            // For simplicity now, we don't auto-delete if onSubmit fails here.
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    const isFormBusy = isUploadingImage || isSubmitting;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 w-full max-w-2xl rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-unbounded text-[#1B0A3F]">Create New Thread</h2>
                    <button onClick={handleModalClose} className="text-[#52007C] hover:text-[#BF4BF6]" disabled={isFormBusy}><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmitForm} className="space-y-6">
                    <div>
                        <label className="block text-[#52007C] font-nunito mb-2">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isFormBusy} className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito" placeholder="Enter thread title" required />
                    </div>
                    <div>
                        <label className="block text-[#52007C] font-nunito mb-2">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isFormBusy} className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito" required>
                            <option value="">Select category</option>
                            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[#52007C] font-nunito mb-2">Content</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isFormBusy} className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito min-h-[150px]" placeholder="Write your thread content..." required />
                    </div>
                    
                    <div>
                        <label className="block text-[#52007C] font-nunito mb-2">Image (optional)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#F6E6FF] text-[#52007C] rounded-lg hover:bg-[#F6E6FF]/80 transition-colors font-nunito ${isFormBusy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <ImageIcon className="h-5 w-5" />
                                Choose Image
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isFormBusy}/>
                            </label>
                            {imagePreview && !isUploadingImage && (
                                <button type="button" onClick={handleRemoveImage} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" disabled={isFormBusy}><X className="h-5 w-5" /></button>
                            )}
                            {isUploadingImage && <RefreshCw className="h-5 w-5 animate-spin text-[#BF4BF6]" />}
                        </div>
                        {imagePreview && (
                            <div className="mt-2"><img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-cover" /></div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={handleModalClose} className="px-4 py-2 bg-gray-100 text-[#52007C] rounded-lg hover:bg-gray-200 transition-colors font-nunito" disabled={isFormBusy}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito disabled:opacity-70" disabled={isFormBusy}>
                            {isSubmitting ? (isUploadingImage ? 'Uploading...' : 'Creating...' ) : 'Create Thread'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateThreadModal;