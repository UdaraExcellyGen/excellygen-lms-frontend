// src/pages/DiscussionForum/components/EditThreadModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { ThreadFormData } from '../types/dto'; // <--- CORRECTED IMPORT PATH
import { uploadForumImage, deleteUploadedFile, isAxiosError as isFileAxiosError } from '../../../../api/fileApi'; // Adjust path
import { toast } from 'react-hot-toast';

interface EditThreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ThreadFormData) => Promise<void>; // onSubmit now handles its own loading/errors
    initialData: ThreadFormData; // Expects initial data including existing imageUrl and relativePath
}

const EditThreadModal: React.FC<EditThreadModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    
    const [imageFile, setImageFile] = useState<File | null>(null); // For newly selected file
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined); // For showing preview
    
    // Store URL and relative path of the image currently associated with the thread (from initialData or new upload)
    const [effectiveImageUrl, setEffectiveImageUrl] = useState<string | undefined>(undefined);
    const [effectiveRelativePath, setEffectiveRelativePath] = useState<string | undefined>(undefined);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const categories = [ /* ... your categories array ... */ 'Software Engineering', 'Quality Assurance', 'Project Management', 'DevOps', 'UI/UX Design', 'Data Science', 'Cloud Computing', 'Cyber Security'];

    useEffect(() => {
        if (isOpen) {
            setTitle(initialData.title);
            setCategory(initialData.category);
            setContent(initialData.content);
            setImageFile(null); // Clear any previously selected file
            setImagePreview(initialData.imageUrl); // Preview existing image URL
            setEffectiveImageUrl(initialData.imageUrl);
            setEffectiveRelativePath(initialData.currentRelativePath); // Important for knowing what to delete
            setIsUploadingImage(false);
            setIsSubmittingForm(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [initialData, isOpen]);

    const handleModalClose = () => {
        // If a new image was uploaded for this edit session but not submitted, delete it
        // This requires tracking if `effectiveRelativePath` changed from `initialData.currentRelativePath`
        // due to a *new* upload within this modal session. For simplicity, we're not doing that cleanup here.
        // Cleanup should ideally be handled server-side for orphaned images.
        onClose();
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file); // Store the new file object
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string); // Show preview of new file
            reader.readAsDataURL(file);
            // effectiveImageUrl and effectiveRelativePath will be updated upon submit if this new file is uploaded
        }
    };

    const handleRemoveImage = async () => {
        setImageFile(null); // Clear any selected new file
        setImagePreview(undefined); // Clear preview
        // By setting imageFile and imagePreview to null/undefined, the submit logic will treat this as removing the image.
        // Actual deletion of existing server image (effectiveRelativePath) will happen on submit.
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingForm(true);

        let finalImageUrlForDTO = effectiveImageUrl;
        let finalRelativePathForDTO = effectiveRelativePath; // Track path for potential future operations

        // Scenario 1: A new image file was selected by the user
        if (imageFile) {
            setIsUploadingImage(true);
            try {
                // If there was an old image associated with this thread, delete it from server first
                if (effectiveRelativePath && effectiveRelativePath === initialData.currentRelativePath) { // Ensure it's the original image
                    await deleteUploadedFile(effectiveRelativePath);
                    console.log("Old thread image deleted:", effectiveRelativePath);
                }
                const uploadData = await uploadForumImage(imageFile);
                finalImageUrlForDTO = uploadData.imageUrl;
                finalRelativePathForDTO = uploadData.relativePath; // Store new relative path
                toast.success("New image uploaded!");
            } catch (err: any) {
                setIsUploadingImage(false); setIsSubmittingForm(false);
                const errorMsg = isFileAxiosError(err) && err.response?.data?.message ? err.response.data.message : "New image upload failed.";
                toast.error(errorMsg);
                return;
            }
            setIsUploadingImage(false);
        } 
        // Scenario 2: No new file, but preview is empty (user clicked 'X' on existing image) AND there was an image
        else if (!imageFile && !imagePreview && effectiveRelativePath) { 
            setIsUploadingImage(true); // Re-use for delete visual feedback
            try {
                await deleteUploadedFile(effectiveRelativePath);
                toast.success("Existing image removed!");
                finalImageUrlForDTO = undefined;
                finalRelativePathForDTO = undefined;
            } catch (err:any) {
                setIsUploadingImage(false); setIsSubmittingForm(false);
                const errorMsg = isFileAxiosError(err) && err.response?.data?.message ? err.response.data.message : "Failed to remove existing image.";
                toast.error(errorMsg);
                return;
            }
            setIsUploadingImage(false);
        }
        // Scenario 3: No new file selected, preview still shows an image -> keep currentEffectiveImageUrl (which is initialData.imageUrl)

        const formDataToSubmit: ThreadFormData = { 
            title, content, category, 
            image: null, // File itself not needed by parent
            imageUrl: finalImageUrlForDTO,
            currentRelativePath: finalRelativePathForDTO // Send potentially new relative path
            // imagePreview is just for this modal's UI state
        };
        
        try {
            await onSubmit(formDataToSubmit);
            // Parent will close the modal upon successful update
        } catch (submitError) {
            console.error("Error during thread update by parent:", submitError);
            // If parent's onSubmit failed, AND we uploaded a *new* image,
            // we might want to delete the newly uploaded image. This gets complex.
            // For now, we assume parent toasts errors and leaves modal open, or parent handles cleanup.
            // If a NEW image was uploaded (finalRelativePath !== initialData.currentRelativePath) and submit failed,
            // it might be orphaned.
        } finally {
             setIsSubmittingForm(false);
        }
    };

    if (!isOpen) return null;
    const isFormBusy = isUploadingImage || isSubmittingForm;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 w-full max-w-2xl rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-unbounded text-[#1B0A3F]">Edit Thread</h2>
                    <button onClick={handleModalClose} disabled={isFormBusy} className="text-[#52007C] hover:text-[#BF4BF6]"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title, Category, Content inputs - similar to CreateThreadModal */}
                    <div>
                        <label className="block text-[#52007C] font-nunito mb-2">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isFormBusy} className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito" required />
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
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isFormBusy} className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito min-h-[150px]" required />
                    </div>
                    {/* Image Section */}
                    <div>
                        <label className="block text-[#52007C] font-nunito mb-2">Image (optional)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#F6E6FF] text-[#52007C] rounded-lg hover:bg-[#F6E6FF]/80 transition-colors font-nunito ${isFormBusy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <ImageIcon className="h-5 w-5" />
                                Change/Add Image
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isFormBusy}/>
                            </label>
                            {imagePreview && !isUploadingImage && ( // Show 'X' if there's a preview and not currently processing an image
                                <button type="button" onClick={handleRemoveImage} disabled={isFormBusy} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
                            )}
                            {isUploadingImage && <RefreshCw className="h-5 w-5 animate-spin text-[#BF4BF6]" />}
                        </div>
                        {imagePreview && (
                            <div className="mt-2"><img src={imagePreview} alt="Current or new preview" className="max-h-40 rounded-lg object-cover" /></div>
                        )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={handleModalClose} disabled={isFormBusy} className="px-4 py-2 bg-gray-100 text-[#52007C] rounded-lg hover:bg-gray-200 font-nunito">Cancel</button>
                        <button type="submit" disabled={isFormBusy} className="px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] font-nunito disabled:opacity-70">
                            {isSubmittingForm ? (isUploadingImage ? 'Processing Image...' : 'Saving...' ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditThreadModal;