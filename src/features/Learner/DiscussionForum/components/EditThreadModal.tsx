// src/pages/DiscussionForum/components/EditThreadModal.tsx (FULL FILE)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { ThreadFormData, CategorySelectOption } from '../types/dto';
import { uploadForumImage, deleteUploadedFile, isAxiosError as isFileAxiosError } from '../../../../api/fileApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { refreshToken as attemptTokenRefresh } from '../../../../api/authApi';
import TiptapEditor from './TiptapEditor';

interface EditThreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ThreadFormData) => Promise<void>;
    initialData: ThreadFormData | null;
    availableCategories: string[];
}

const EditThreadModal: React.FC<EditThreadModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData, 
    availableCategories 
}) => {
    const { logout: triggerAuthContextLogout } = useAuth();

    // Form field states
    const [title, setTitle] = useState('');
    const [selectedCategoryOption, setSelectedCategoryOption] = useState<SingleValue<CategorySelectOption>>(null);
    const [content, setContent] = useState('');
    
    // Image related states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    
    // Tracks the image that IS CURRENTLY effectively set for the thread on the server
    const [effectiveImageUrl, setEffectiveImageUrl] = useState<string | undefined>(undefined);
    const [effectiveRelativePath, setEffectiveRelativePath] = useState<string | undefined>(undefined);

    // Loading states
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categoryOptionsForSelect: CategorySelectOption[] = React.useMemo(() =>
        availableCategories.map(catTitle => ({ value: catTitle, label: catTitle })),
    [availableCategories]);
    
    const callFileApiWithRetry = useCallback(async <T,>(
        apiCall: () => Promise<T>,
        markAsRetried: boolean = false
    ): Promise<T | null> => { 
        try { return await apiCall(); }
        catch (err: any) {
            if (isFileAxiosError(err) && err.response?.status === 401 && !markAsRetried) {
                try {
                    await attemptTokenRefresh(); 
                    return await callFileApiWithRetry(apiCall, true); 
                } catch (refreshError) {
                    toast.error('Session expired. Please login again.'); 
                    if (triggerAuthContextLogout) triggerAuthContextLogout(); 
                    return null;
                }
            } 
            throw err;
        }
    }, [triggerAuthContextLogout]);

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title);
            const initialCatOpt = categoryOptionsForSelect.find(opt => opt.value === initialData.category) || null;
            setSelectedCategoryOption(initialCatOpt);
            setContent(initialData.content);
            
            setImageFile(null);
            setImagePreview(initialData.imageUrl ?? undefined);
            setEffectiveImageUrl(initialData.imageUrl ?? undefined);
            setEffectiveRelativePath(initialData.currentRelativePath ?? undefined);
            
            setIsProcessingImage(false);
            setIsSubmittingForm(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [initialData, isOpen, categoryOptionsForSelect]);

    const handleModalClose = () => {
        onClose();
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(effectiveImageUrl);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryOption?.value) { toast.error("Please select a category."); return; }
        if (!initialData) { toast.error("Error: Initial thread data is missing for edit."); return; }
        if (!content || content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
            toast.error("Content cannot be empty.");
            return;
        }
        setIsSubmittingForm(true);

        let finalImageUrlForParent = effectiveImageUrl;
        let finalRelativePathForParent = effectiveRelativePath;
        
        try {
            if (imageFile) {
                setIsProcessingImage(true);
                if (initialData.currentRelativePath) {
                    try {
                        await callFileApiWithRetry(() => deleteUploadedFile(initialData.currentRelativePath!));
                    } catch (delErr) {
                        console.warn("EditModal: Failed to delete old server image during replacement.", delErr);
                    }
                }
                const uploadData = await callFileApiWithRetry<{imageUrl: string; relativePath: string | null;} | null>(
                    () => uploadForumImage(imageFile)
                );
                setIsProcessingImage(false);
                if (!uploadData) {
                    setIsSubmittingForm(false); 
                    return;
                }
                
                finalImageUrlForParent = uploadData.imageUrl;
                finalRelativePathForParent = uploadData.relativePath ?? uploadData.imageUrl;
            } 
            else if (!imageFile && !imagePreview && initialData.currentRelativePath) { 
                setIsProcessingImage(true);
                await callFileApiWithRetry(() => deleteUploadedFile(initialData.currentRelativePath!));
                setIsProcessingImage(false);
                finalImageUrlForParent = undefined;
                finalRelativePathForParent = undefined;
            }

            const formDataToSubmit: ThreadFormData = { 
                title, 
                content, 
                category: selectedCategoryOption.value, 
                image: null,
                imageUrl: finalImageUrlForParent, 
                currentRelativePath: finalRelativePathForParent 
            };
            
            await onSubmit(formDataToSubmit);
        } catch (err: any) {
            console.error("EditThreadModal handleSubmit error:", err);
            toast.error(isFileAxiosError(err) ? ((err.response?.data as { message?: string })?.message || err.message) : err.message || "Failed to update thread.");
        } finally {
             setIsSubmittingForm(false); 
             setIsProcessingImage(false);
        }
    };

    if (!isOpen || !initialData) return null;
    const isFormBusy = isProcessingImage || isSubmittingForm;
    
    const selectStyles: StylesConfig<CategorySelectOption, false> = {
        control: (base, state) => ({ 
            ...base, 
            fontFamily: 'Nunito, sans-serif', 
            backgroundColor: state.isDisabled ? '#f3f4f6' :'#F6E6FFBF', 
            borderColor: state.isFocused ? '#BF4BF6' : '#BF4BF633', 
            boxShadow: state.isFocused ? '0 0 0 1px #BF4BF6' : 'none', 
            borderRadius: '0.5rem', 
            minHeight: '42px'
        }),
        menu: (base) => ({ 
            ...base, 
            fontFamily: 'Nunito, sans-serif', 
            zIndex: 1055 
        }),
        menuPortal: base => ({ ...base, zIndex: 99999 }),
        singleValue: (base) => ({ ...base, color: '#1B0A3F' }),
        placeholder: (base) => ({ ...base, color: '#52007C99' }),
        option: (base, state) => ({
            ...base, 
            backgroundColor: state.isSelected ? '#BF4BF6' : state.isFocused ? '#F0D9FF' : 'white', 
            color: state.isSelected? 'white': '#1B0A3F', 
            ':active': { backgroundColor: '#D0A0E6' }
        })
    };
    
    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* --- MODIFIED: Added flex, flex-col, and max-h-[90vh] --- */}
            <div className="bg-white/95 w-full max-w-2xl rounded-xl border border-purple-300/50 p-6 shadow-xl relative flex flex-col max-h-[90vh]">
                {isFormBusy && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center rounded-xl">
                        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        <p className="text-sm text-purple-700 mt-2">
                            {isProcessingImage ? "Processing image..." : (isSubmittingForm ? "Updating thread..." : "Processing...")}
                        </p>
                    </div>
                )}
                 {/* --- MODIFIED: This div is now a flex container for the form elements --- */}
                <div className={`flex flex-col flex-1 min-h-0 transition-opacity duration-300 ${isFormBusy ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    {/* --- MODIFIED: Header is now a non-shrinking flex item --- */}
                    <div className="flex-shrink-0 flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-purple-800">Edit Thread</h2>
                        <button onClick={handleModalClose} disabled={isFormBusy} className="text-purple-600 hover:text-purple-800"><X className="h-6 w-6" /></button>
                    </div>

                    {/* --- MODIFIED: Form is now a scrollable, growing flex item --- */}
                    <form id="edit-thread-form-id" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 space-y-5 pb-4">
                        <div>
                            <label htmlFor="editThreadTitleModalInput" className="block text-sm font-medium text-purple-700 mb-1">Title</label>
                            <input id="editThreadTitleModalInput" type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isFormBusy} className="w-full px-3 py-2.5 text-sm border-purple-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-purple-50/60 placeholder-purple-400 text-purple-900" required />
                        </div>
                        <div>
                            <label htmlFor="editThreadCategoryModalSelectInput" className="block text-sm font-medium text-purple-700 mb-1">Category</label>
                            <Select<CategorySelectOption, false>
                                instanceId="edit-modal-category-select-instance" 
                                inputId="editThreadCategoryModalSelectInput"
                                value={selectedCategoryOption} 
                                onChange={(option) => setSelectedCategoryOption(option)}
                                options={categoryOptionsForSelect}
                                isDisabled={isFormBusy || availableCategories.length === 0}
                                placeholder="Select or type to search..."
                                isClearable={true}
                                styles={selectStyles} 
                                menuPlacement="auto"
                                menuPortalTarget={document.body}
                            />
                            {availableCategories.length === 0 && !isFormBusy &&<p className="text-xs text-red-500 mt-1">No categories available.</p>}
                        </div>
                        <div>
                            <label htmlFor="editThreadContentModalInput" className="block text-sm font-medium text-purple-700 mb-1">Content</label>
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                disabled={isFormBusy}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">Image</label>
                            <div className="mt-1 flex items-center gap-3">
                                <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200/70 transition-colors font-medium text-sm ${isFormBusy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <ImageIcon size={18} /> {imagePreview ? "Change Image" : "Add Image"}
                                    <input type="file" ref={fileInputRef} accept="image/*,.jpg,.jpeg,.png,.gif" onChange={handleImageFileChange} className="hidden" disabled={isFormBusy}/>
                                </label>
                                {imagePreview && !isProcessingImage && (
                                    <button type="button" onClick={handleRemoveImage} disabled={isFormBusy} className="p-1.5 text-red-500 hover:bg-red-100/50 rounded-md transition-colors" title="Remove current image"><X size={18} /></button>
                                )}
                                {isProcessingImage && <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />}
                            </div>
                            {imagePreview && (
                                <div className="mt-2.5">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="max-h-32 rounded-md object-cover border border-purple-200" 
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            {!imagePreview && <p className="text-xs text-gray-500 mt-1 italic">No image will be set for this thread.</p>}
                        </div>
                    </form>

                    {/* --- MODIFIED: Footer is now a non-shrinking flex item --- */}
                    <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-purple-200/30 mt-6">
                        <button type="button" onClick={handleModalClose} disabled={isFormBusy} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors">Cancel</button>
                        <button type="submit" form="edit-thread-form-id" disabled={isFormBusy || !selectedCategoryOption?.value } className="px-6 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-60 min-w-[120px]"> 
                             {isSubmittingForm ? <RefreshCw className="h-5 w-5 animate-spin inline"/> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default EditThreadModal;