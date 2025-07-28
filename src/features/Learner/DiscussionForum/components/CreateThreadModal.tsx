// src/pages/DiscussionForum/components/CreateThreadModal.tsx (FULL FILE)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { ThreadFormData, CategorySelectOption } from '../types/dto';
import { uploadForumImage, deleteUploadedFile, isAxiosError as isFileAxiosError } from '../../../../api/fileApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { refreshToken as attemptTokenRefresh } from '../../../../api/authApi';
import TiptapEditor from './TiptapEditor';

interface CreateThreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ThreadFormData) => Promise<void>;
    availableCategories: string[];
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    availableCategories
}) => {
    const { logout: triggerAuthContextLogout } = useAuth();

    const [title, setTitle] = useState('');
    const [selectedCategoryOption, setSelectedCategoryOption] = useState<SingleValue<CategorySelectOption>>(null);
    const [content, setContent] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    const [sessionUploadedImageUrl, setSessionUploadedImageUrl] = useState<string | undefined>(undefined);
    const [sessionUploadedRelativePath, setSessionUploadedRelativePath] = useState<string | undefined>(undefined);

    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const categoryOptionsForSelect: CategorySelectOption[] = React.useMemo(() =>
        availableCategories.map(catTitle => ({ value: catTitle, label: catTitle })),
    [availableCategories]);

    // Styles
    const selectStyles: StylesConfig<CategorySelectOption, false> = {
        control: (base, state) => ({
            ...base,
            fontFamily: 'Nunito, sans-serif',
            backgroundColor: state.isDisabled ? '#f3f4f6' : '#F6E6FFBF',
            borderColor: state.isFocused ? '#BF4BF6' : '#BF4BF633',
            boxShadow: state.isFocused ? '0 0 0 1px #BF4BF6' : 'none',
            borderRadius: '0.5rem',
            minHeight: '42px',
        }),
        menu: (base) => ({
            ...base,
            fontFamily: 'Nunito, sans-serif',
            zIndex: 1055
        }),
        menuPortal: base => ({ ...base, zIndex: 99999 }),
        singleValue: (base) => ({
            ...base,
            color: '#1B0A3F'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#52007C99'
        }),
        option: (base, state) => ({
            ...base,
            fontFamily: 'Nunito, sans-serif',
            backgroundColor: state.isSelected ? '#BF4BF6' : state.isFocused ? '#F0D9FF' : 'white',
            color: state.isSelected ? 'white' : '#1B0A3F',
            ':active': {
                backgroundColor: '#D0A0E6'
            }
        })
    };

    const callFileApiWithRetry = useCallback(async <T,>(
        apiCall: () => Promise<T>,
        markAsRetried: boolean = false
    ): Promise<T | null> => {
        try { return await apiCall(); }
        catch (err: any) {
            if (isFileAxiosError(err) && err.response?.status === 401 && !markAsRetried) {
                try { await attemptTokenRefresh(); return await callFileApiWithRetry(apiCall, true); }
                catch (refreshError) {
                    toast.error('Session expired. Please login again.');
                    if (triggerAuthContextLogout) triggerAuthContextLogout();
                    return null;
                }
            } throw err;
        }
    }, [triggerAuthContextLogout]);

    const resetFormState = useCallback(() => {
        setTitle(''); setSelectedCategoryOption(null); setContent('');
        setImageFile(null); setImagePreview(undefined);
        setSessionUploadedImageUrl(undefined); setSessionUploadedRelativePath(undefined);
        setIsProcessingImage(false); setIsSubmittingForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    useEffect(() => {
        if (isOpen) { resetFormState(); }
    }, [isOpen, resetFormState]);

    const handleModalClose = async () => {
        if (sessionUploadedRelativePath) {
            setIsProcessingImage(true);
            try { await callFileApiWithRetry(() => deleteUploadedFile(sessionUploadedRelativePath)); }
            catch (err) { console.error("Error deleting unsaved image on close:", err); }
            finally { setIsProcessingImage(false); }
        }
        resetFormState();
        onClose();
    };

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (sessionUploadedRelativePath) {
             setIsProcessingImage(true);
             try { await callFileApiWithRetry(() => deleteUploadedFile(sessionUploadedRelativePath)); }
             catch (err) { console.error("Pre-delete failed:", err); }
             finally {
                 setSessionUploadedImageUrl(undefined); setSessionUploadedRelativePath(undefined);
             }
        }

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadstart = () => setIsProcessingImage(true);
            reader.onloadend = () => { setImagePreview(reader.result as string); setIsProcessingImage(false); };
            reader.onerror = () => { setIsProcessingImage(false); toast.error("Error reading file."); };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null); setImagePreview(undefined); setIsProcessingImage(false);
        }
    };

    const handleRemoveImage = async () => {
        if (sessionUploadedRelativePath) {
            setIsProcessingImage(true);
            try { 
                await callFileApiWithRetry(() => deleteUploadedFile(sessionUploadedRelativePath)); 
                toast.success("Uploaded image removed."); 
            }
            catch (err: any) { 
                let errorMessage = "Could not remove server image.";
                if (isFileAxiosError(err)) {
                    errorMessage = (err.response?.data as { message?: string })?.message || err.message || errorMessage;
                } else if (err instanceof Error) {
                    errorMessage = err.message || errorMessage;
                }
                toast.error(errorMessage);
            }
            finally { setIsProcessingImage(false); }
        }
        setImageFile(null); setImagePreview(undefined);
        setSessionUploadedImageUrl(undefined); setSessionUploadedRelativePath(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryOption?.value) { toast.error("Please select a category."); return; }
        if (!content || content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
            toast.error("Content cannot be empty.");
            return;
        }

        setIsSubmittingForm(true);
        let finalImageUrlForParent = sessionUploadedImageUrl;
        let finalRelativePathForParent = sessionUploadedRelativePath;

        if (imageFile && !sessionUploadedImageUrl) {
            setIsProcessingImage(true);
            try {
                const uploadData = await callFileApiWithRetry<{imageUrl: string; relativePath: string | null;} | null>(() => uploadForumImage(imageFile));
                if (!uploadData) { 
                    setIsProcessingImage(false); 
                    setIsSubmittingForm(false); 
                    return; 
                }
                
                finalImageUrlForParent = uploadData.imageUrl;
                finalRelativePathForParent = uploadData.relativePath ?? undefined;
                
                setSessionUploadedImageUrl(finalImageUrlForParent);
                setSessionUploadedRelativePath(finalRelativePathForParent);
            } catch (err: any) {
                setIsProcessingImage(false); setIsSubmittingForm(false);
                let errorMessage = "Image upload failed.";
                if (isFileAxiosError(err)) {
                    errorMessage = (err.response?.data as { message?: string })?.message || err.message || errorMessage;
                } else if (err instanceof Error) {
                    errorMessage = err.message || errorMessage;
                }
                toast.error(errorMessage); 
                return;
            }
            setIsProcessingImage(false);
        }

        const formDataToSubmit: ThreadFormData = {
            title, 
            content, 
            category: selectedCategoryOption.value,
            image: null, 
            imageUrl: finalImageUrlForParent, 
            currentRelativePath: finalRelativePathForParent
        };

        try { 
            await onSubmit(formDataToSubmit); 
        }
        catch (submitError: any) {
            console.error("CreateModal: Parent onSubmit failed:", submitError);
            if (imageFile && finalRelativePathForParent && finalRelativePathForParent === sessionUploadedRelativePath) {
                setIsProcessingImage(true);
                try {
                    await callFileApiWithRetry(() => deleteUploadedFile(finalRelativePathForParent!));
                    toast("Cleaned up uploaded image due to creation error.");
                } catch(delErr) {
                    console.error("Image cleanup on parent error failed:", delErr);
                    toast.error("Thread not created & image cleanup failed.");
                } finally {
                    setIsProcessingImage(false);
                    setSessionUploadedImageUrl(undefined); setSessionUploadedRelativePath(undefined);
                }
            }
        }
        finally { setIsSubmittingForm(false); }
    };

    if (!isOpen) return null;
    const isFormBusy = isProcessingImage || isSubmittingForm;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 w-full max-w-2xl rounded-xl border border-purple-300/50 p-6 shadow-xl relative flex flex-col max-h-[90vh]">
                {isFormBusy && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center rounded-xl">
                        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        <p className="text-sm text-purple-700 mt-2">
                            {isProcessingImage ? "Processing image..." : (isSubmittingForm ? "Creating thread..." : "Processing...")}
                        </p>
                    </div>
                )}
                <div className={`flex flex-col flex-1 min-h-0 transition-opacity duration-300 ${isFormBusy ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex-shrink-0 flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-purple-800">Create New Thread</h2>
                        <button onClick={handleModalClose} className="text-purple-600 hover:text-purple-800" disabled={isFormBusy}><X className="h-6 w-6" /></button>
                    </div>
                    
                    {/* --- FIX: Added id="create-thread-form-id" to link the form with the external submit button --- */}
                    <form id="create-thread-form-id" onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto pr-4 space-y-5 pb-4">
                        <div>
                            <label htmlFor="createThreadTitle" className="block text-sm font-medium text-purple-700 mb-1">Title</label>
                            <input id="createThreadTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isFormBusy} className="w-full px-3 py-2.5 text-sm border-purple-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-purple-50/60 placeholder-purple-400 text-purple-900" placeholder="Enter thread title" required />
                        </div>
                        <div>
                            <label htmlFor="createThreadCategoryModalInput" className="block text-sm font-medium text-purple-700 mb-1">Category</label>
                            <Select<CategorySelectOption, false>
                                instanceId="create-modal-category-select-instance-final" inputId="createThreadCategoryModalInput"
                                value={selectedCategoryOption} onChange={(option) => setSelectedCategoryOption(option)}
                                options={categoryOptionsForSelect}
                                isDisabled={isFormBusy || availableCategories.length === 0}
                                placeholder="Select or type to search..."
                                isClearable={true} styles={selectStyles} menuPlacement="auto"
                                menuPortalTarget={document.body}
                            />
                            {availableCategories.length === 0 && !isFormBusy && <p className="text-xs text-red-500 mt-1">No categories found.</p>}
                        </div>
                        <div>
                            <label htmlFor="createThreadContent" className="block text-sm font-medium text-purple-700 mb-1">Content</label>
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                disabled={isFormBusy}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">Image (optional)</label>
                            <div className="mt-1 flex items-center gap-3">
                                <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200/70 transition-colors font-medium text-sm ${isFormBusy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <ImageIcon size={18} /> Choose Image
                                    <input type="file" ref={fileInputRef} accept="image/*,.jpg,.jpeg,.png,.gif" onChange={handleImageFileChange} className="hidden" disabled={isFormBusy}/>
                                </label>
                                {imagePreview && !isProcessingImage && (
                                    <button type="button" onClick={handleRemoveImage} className="p-1.5 text-red-500 hover:bg-red-100/50 rounded-md transition-colors" disabled={isFormBusy} title="Remove image"><X size={18} /></button>
                                )}
                                {isProcessingImage && <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />}
                            </div>
                            {imagePreview && (<div className="mt-2.5"><img src={imagePreview} alt="Preview" className="max-h-32 rounded-md object-cover border border-purple-200" /></div>)}
                        </div>
                    </form>

                    <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-purple-200/30 mt-6">
                        <button type="button" onClick={handleModalClose} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors" disabled={isFormBusy}>Cancel</button>
                        <button type="submit" form="create-thread-form-id" className="px-6 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-60 min-w-[140px]" disabled={isFormBusy || !selectedCategoryOption?.value }>
                            {isSubmittingForm
                                ? <RefreshCw className="h-5 w-5 animate-spin inline"/>
                                : 'Create Thread'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CreateThreadModal;