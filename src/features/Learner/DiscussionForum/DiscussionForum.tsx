// src/pages/DiscussionForum/DiscussionForum.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { 
    MessageSquare, Search, Plus, Clock, MessageCircle, Edit2, Trash2, Eye, 
    RefreshCw, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import CreateThreadModal from './components/CreateThreadModal';
import EditThreadModal from './components/EditThreadModal';
import DeleteItemDialog from './components/DeleteItemDialog';
import MyThreadsButton from './components/MyThreadsButton';
import CommentSection from './components/CommentSection';
import * as forumApi from '../../../api/forumApi'; // Assumes this uses your global apiClient from apiClient.ts
// No need for local attemptTokenRefresh import if apiClient handles it globally
import { 
    ThreadFormData, ForumThreadDto, ForumQueryParams, PagedResult, 
    CreateForumThreadDto, UpdateForumThreadDto, CategorySelectOption 
} from './types/dto'; 
import { useAuth } from '../../../contexts/AuthContext'; 
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getAllCategories as fetchAllCourseCategoriesFromAdminApi } from '../../../features/Admin/ManageCourseCategory/data/api'; 
import { Category as AdminCourseCategoryType } from '../../../features/Admin/ManageCourseCategory/types/category.types'; 

const DEFAULT_PAGE_SIZE = 10;

const DiscussionForum: React.FC = () => {
    const { user } = useAuth(); // Removed triggerAuthContextLogout if global apiClient handles logout event
    const [threads, setThreads] = useState<ForumThreadDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [courseCategories, setCourseCategories] = useState<AdminCourseCategoryType[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<ForumThreadDto | null>(null);
    const [threadToEdit, setThreadToEdit] = useState<ForumThreadDto | null>(null);

    const [searchInput, setSearchInput] = useState(''); 
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    const [selectedCategoryFilterOption, setSelectedCategoryFilterOption] = useState<SingleValue<CategorySelectOption>>({ value: 'all', label: 'All Categories' });
    const [showMyThreads, setShowMyThreads] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalThreads, setTotalThreads] = useState(0);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Removed local callApiWithRetry helper function

    useEffect(() => {
        const loadCategories = async () => { 
            setIsLoadingCategories(true); setErrorCategories(null);
            try { 
                // Assuming fetchAllCourseCategoriesFromAdminApi uses an apiClient that also handles auth
                const categoriesData = await fetchAllCourseCategoriesFromAdminApi(); 
                setCourseCategories(categoriesData.filter(cat => cat.status === 'active')); 
            } catch (err: any) { 
                const msg = forumApi.isAxiosError(err) ? err.response?.data?.message || err.message : err.message || "Could not load categories";
                setErrorCategories(msg); toast.error(`Categories Error: ${msg}`); 
            } finally { setIsLoadingCategories(false); }
        };
        loadCategories();
    }, []);

    useEffect(() => { // Debounce search input
        const timerId = setTimeout(() => { setDebouncedSearchQuery(searchInput); }, 500); 
        return () => clearTimeout(timerId);
    }, [searchInput]);

    const filterCategoryOptions: CategorySelectOption[] = [ { value: 'all', label: 'All Categories' }, ...courseCategories.map(cat => ({ value: cat.title, label: cat.title })) ];
    const handleCategoryFilterChange = (selectedOption: SingleValue<CategorySelectOption>) => { setSelectedCategoryFilterOption(selectedOption); };
    
    const fetchThreads = useCallback(async (page = 1) => { 
        setIsLoading(true); setError(null);
        try {
            const params: ForumQueryParams = { 
                PageNumber: page, PageSize: DEFAULT_PAGE_SIZE, 
                SearchTerm: debouncedSearchQuery || undefined, 
                Category: (selectedCategoryFilterOption && selectedCategoryFilterOption.value !== 'all') ? selectedCategoryFilterOption.value : undefined, 
                MyThreads: showMyThreads || undefined,
            };
            const result = await forumApi.getThreads(params); // Direct API call
            setThreads(result.items.map(t => ({ ...t, showComments: t.showComments || false }))); 
            setTotalPages(result.totalPages); setCurrentPage(result.pageNumber); setTotalThreads(result.totalCount);
        } catch (err: any) { 
            // Global apiClient should handle 401/refresh. This catch is for other errors.
            const errorMessage = forumApi.isAxiosError(err) && err.response?.data?.message 
                ? err.response.data.message 
                : err.message || 'Could not load threads.';
            setError(errorMessage); toast.error(`Threads Error: ${errorMessage}`); 
            setThreads([]); setTotalPages(0); setTotalThreads(0); 
        } 
        finally { setIsLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [debouncedSearchQuery, selectedCategoryFilterOption?.value, showMyThreads]); // Depend on primitive value

    useEffect(() => { fetchThreads(currentPage); }, [fetchThreads, currentPage]);
    useEffect(() => { 
        if (currentPage !== 1) setCurrentPage(1); 
        else fetchThreads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, selectedCategoryFilterOption?.value, showMyThreads]);


// Update this function in your DiscussionForum.tsx

// Updated handleCreateThread method for DiscussionForum.tsx
// This method should match the backend DTO property names

const handleCreateThread = async (formDataFromModal: ThreadFormData) => { 
    setIsActionLoading(true);
    try {
        console.log('Creating thread with data:', formDataFromModal);
        
        // Create DTO that matches backend property names exactly
        const createDto: CreateForumThreadDto = {
            title: formDataFromModal.title, 
            content: formDataFromModal.content, 
            category: formDataFromModal.category, 
            // Use imageUrl property to match the backend
            imageUrl: formDataFromModal.imageUrl
        };
        
        console.log('Sending to API:', createDto);
        
        await forumApi.createThread(createDto); 
        toast.success('Thread created successfully!'); 
        setIsCreateModalOpen(false);
        setSearchInput(''); 
        setSelectedCategoryFilterOption({ value: 'all', label: 'All Categories' }); 
        setShowMyThreads(false); 
        if (currentPage !== 1) setCurrentPage(1); else fetchThreads(1);
    } catch (err: any) { 
        console.error('Thread creation error:', err);
        toast.error(`Create thread failed: ${forumApi.isAxiosError(err) && err.response?.data?.message ? err.response.data.message : err.message}`); 
    } 
    finally { setIsActionLoading(false); }
};
    
    const handleEditClick = (thread: ForumThreadDto) => { 
        setThreadToEdit(thread); setIsEditModalOpen(true);
    };

// Update this method in your DiscussionForum.tsx component
// This ensures the imageUrl is correctly passed to the backend

const handleUpdateThread = async (formDataFromModal: ThreadFormData) => { 
    if (!threadToEdit) return; 
    setIsActionLoading(true);
    
    try {
        // Log received form data
        console.log('Updating thread with data:', formDataFromModal);
        
        const updateDto: UpdateForumThreadDto = {
            title: formDataFromModal.title, 
            content: formDataFromModal.content, 
            category: formDataFromModal.category,
            // Use imageUrl property to match the backend
            imageUrl: formDataFromModal.imageUrl,
            // Add a flag to indicate if the image should be removed
            removeCurrentImage: !formDataFromModal.imageUrl && !!threadToEdit.imageUrl
        };
        
        console.log('Sending to API:', updateDto);
        
        const updatedThread = await forumApi.updateThread(threadToEdit.id, updateDto);
        toast.success('Thread updated successfully!');
        
        // Update the thread in the state
        setThreads(prev => prev.map(t => 
            t.id === updatedThread.id 
                ? { ...t, ...updatedThread, showComments: t.showComments } 
                : t
        ));
        
        setIsEditModalOpen(false); 
        setThreadToEdit(null);
    } catch (err: any) { 
        console.error('Thread update error:', err);
        toast.error(`Update thread failed: ${forumApi.isAxiosError(err) && err.response?.data?.message ? err.response.data.message : err.message}`); 
    } 
    finally { 
        setIsActionLoading(false); 
    }
};

    const handleDeleteClick = (thread: ForumThreadDto) => { setThreadToDelete(thread); setIsDeleteDialogOpen(true); };
    const handleDeleteConfirm = async () => { 
        if (!threadToDelete) return; setIsActionLoading(true);
        try { 
            await forumApi.deleteThread(threadToDelete.id); 
            toast.success('Thread deleted successfully!');
            const newTotalThreads = totalThreads - 1;
            const newTotalPages = Math.max(1, Math.ceil(newTotalThreads / DEFAULT_PAGE_SIZE));
            let pageToFetch = currentPage > newTotalPages ? newTotalPages : currentPage;
            pageToFetch = threads.length === 1 && pageToFetch > 1 ? pageToFetch - 1 : pageToFetch;
            
            if (pageToFetch !== currentPage) setCurrentPage(pageToFetch); else fetchThreads(pageToFetch);
        } catch (err: any) { 
            toast.error(`Delete thread failed: ${forumApi.isAxiosError(err) && err.response?.data?.message ? err.response.data.message : err.message}`); 
        } 
        finally { setIsActionLoading(false); setIsDeleteDialogOpen(false); setThreadToDelete(null); }
    };
    const toggleShowComments = (threadId: number) => { setThreads(prev => prev.map(t => t.id === threadId ? { ...t, showComments: !t.showComments } : t));};
    const handlePreviousPage = () => { (currentPage > 1) && setCurrentPage(p => p - 1);};
    const handleNextPage = () => { (currentPage < totalPages) && setCurrentPage(p => p + 1);};
    const formatRelativeTime = (dateStringISO?: string): string => { if (!dateStringISO) return 'just now'; try { return formatDistanceToNow(parseISO(dateStringISO), { addSuffix: true }); } catch { return dateStringISO; } };
    
    const editModalInitialData: ThreadFormData | undefined = threadToEdit ? {
        title: threadToEdit.title, content: threadToEdit.content, category: threadToEdit.category,
        image: null, imagePreview: threadToEdit.imageUrl, imageUrl: threadToEdit.imageUrl,
        currentRelativePath: threadToEdit.imageUrl && threadToEdit.imageUrl.includes("/uploads/") 
            ? threadToEdit.imageUrl.substring(threadToEdit.imageUrl.indexOf("/uploads/")) 
            : undefined
    } : undefined;

    const selectFilterStyles: StylesConfig<CategorySelectOption, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(253, 246, 255, 0.7)',
            border: state.isFocused 
              ? '2px solid #BF4BF6' 
              : '1px solid rgba(208, 160, 230, 0.5)',
            boxShadow: state.isFocused ? '0 0 0 1px #BF4BF6' : 'none',
            borderRadius: '0.5rem',
            padding: '0.15rem 0.25rem',
            fontSize: '0.875rem',
            fontFamily: '"Nunito", sans-serif',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#BF4BF6',
            },
            minHeight: '42px',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'rgba(82, 0, 124, 0.7)',
            fontSize: '0.875rem',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
              ? '#7A00B8' 
              : state.isFocused 
                ? 'rgba(191, 75, 246, 0.1)' 
                : 'white',
            color: state.isSelected ? 'white' : '#1B0A3F',
            fontSize: '0.875rem',
            fontFamily: '"Nunito", sans-serif',
            cursor: 'pointer',
            '&:active': {
              backgroundColor: '#7A00B8',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 50,
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0.25rem',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1B0A3F',
            fontSize: '0.875rem',
            fontFamily: '"Nunito", sans-serif',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#7A00B8' : 'rgba(82, 0, 124, 0.7)',
            '&:hover': {
              color: '#7A00B8',
            },
            padding: '0 8px',
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(208, 160, 230, 0.5)',
        }),
        clearIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#7A00B8' : 'rgba(82, 0, 124, 0.7)',
            '&:hover': {
              color: '#7A00B8',
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '2px 8px',
        }),
        input: (provided) => ({
            ...provided,
            color: '#1B0A3F',
            fontFamily: '"Nunito", sans-serif',
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: 'rgba(82, 0, 124, 0.7)',
            fontFamily: '"Nunito", sans-serif',
            fontSize: '0.875rem',
        }),
    };

    // --- JSX ---
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C]">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">Discussion Forum</h1>
                            <p className="text-[#D68BF9] text-lg font-nunito">Connect and learn with your peers</p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2 md:gap-4 self-start md:self-center">
                            <MyThreadsButton onClick={() => setShowMyThreads(prev => !prev)} active={showMyThreads} />
                            <button onClick={() => setIsCreateModalOpen(true)} disabled={isLoading || isActionLoading || isLoadingCategories} className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-xl hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 flex items-center gap-2 font-nunito shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                <Plus className="h-5 w-5" /><span className="hidden sm:inline">Create Thread</span><span className="sm:hidden">New</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters Bar (Using YOUR CSS Classes based on your screenshot) */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-300/40 shadow-md">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-700" />
                                <input 
                                    ref={searchInputRef} type="text" placeholder="Search threads..." value={searchInput} 
                                    onChange={(e) => setSearchInput(e.target.value)} 
                                    disabled={isLoading || isActionLoading || isLoadingCategories} 
                                    className="w-full bg-purple-50/50 border border-purple-300/50 rounded-lg pl-12 pr-4 py-3 text-purple-900 placeholder-purple-500/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-nunito text-sm" 
                                />
                            </div>
                            <div className="w-full md:w-auto md:min-w-[180px] lg:min-w-[220px]"> 
                                <Select<CategorySelectOption, false>
                                    instanceId="main-category-filter-global"
                                    value={selectedCategoryFilterOption} onChange={handleCategoryFilterChange}
                                    options={filterCategoryOptions} isLoading={isLoadingCategories}
                                    isDisabled={isLoading || isActionLoading || isLoadingCategories || courseCategories.length === 0 && !errorCategories}
                                    placeholder="All Categories" isClearable={false} styles={selectFilterStyles}
                                    menuPortalTarget={typeof window !== 'undefined' ? document.body : null} 
                                    menuPlacement="auto" menuPosition="fixed" classNamePrefix="react-select-filter"
                                />
                            </div>
                        </div>
                        {isLoadingCategories && <p className="text-xs text-purple-200 pt-2 text-center">Loading categories...</p>}
                        {errorCategories && <p className="text-xs text-red-300 pt-2 text-center">Error: {errorCategories}</p>}
                        {!isLoadingCategories && courseCategories.length === 0 && !errorCategories && (<p className="text-xs text-purple-200 pt-2 text-center">No categories available.</p>)}
                    </div>
                    
                    {/* Loading / Error / Thread List (Using YOUR CSS Classes) */}
                    {isLoading && threads.length === 0 && (<div className="flex justify-center items-center p-10 text-white"><RefreshCw className="h-8 w-8 animate-spin mr-3" /><span>Loading threads...</span></div>)}
                    {error && !isLoading && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert"><AlertCircle className="inline h-5 w-5 mr-2 align-text-bottom"/><strong className="font-bold mr-1">Error!</strong><span className="block sm:inline">{error}</span><button onClick={() => fetchThreads(1)} className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-nunito">Retry</button></div>)}
                    {!error && (
                     <>
                        <div className="space-y-4 relative"> 
                            {(isLoading || isActionLoading) && threads.length > 0 && (<div className="absolute inset-0 bg-purple-700/10 backdrop-blur-xs z-10 flex items-center justify-center rounded-lg"><RefreshCw className="h-6 w-6 animate-spin text-white/80" /></div>)}
                            {!isLoading && threads.length === 0 && (<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-300/30 p-8 text-center mt-4"><MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" /><h3 className="text-xl font-medium text-purple-800 mb-2 font-unbounded">No threads found</h3><p className="text-purple-700/80 font-nunito">{showMyThreads ? "You haven't created any threads." : "No threads match filters."}</p></div>)}
                            
                            {threads.map(thread => (
                                <div key={thread.id} className={`bg-white/90 backdrop-blur-sm rounded-xl border border-purple-300/40 shadow-md overflow-hidden hover:shadow-purple-300/40 transition-all duration-300 ${isActionLoading && (threadToEdit?.id === thread.id || threadToDelete?.id === thread.id) ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <div className="p-4 sm:p-5">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow" title={thread.author?.name ?? 'User'}>
                                                {thread.author?.avatar ? (<img src={thread.author.avatar} alt={thread.author.name ?? ''} className="w-full h-full rounded-full object-cover" />) : (thread.author?.name?.charAt(0)?.toUpperCase() ?? 'A')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-bold text-purple-900" title={thread.title}>{thread.title}</h3>
                                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                            <span className="font-medium text-purple-700">{thread.author?.name ?? 'Anonymous'}</span><Clock className="h-3 w-3 mx-1.5 text-gray-400" /><span>{formatRelativeTime(thread.createdAt)}</span>
                                                            {thread.updatedAt && new Date(parseISO(thread.updatedAt)).getTime() > new Date(parseISO(thread.createdAt)).getTime() + (60 * 1000) && (
                                                                <span className="ml-2 italic text-gray-400 text-[10px] sm:text-xs">(edited {formatRelativeTime(thread.updatedAt)})</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {thread.isCurrentUserAuthor && ( <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button title="Edit Thread" disabled={isActionLoading} className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-100/50 rounded-md" onClick={() => handleEditClick(thread)}><Edit2 size={16} /></button>
                                                        <button title="Delete Thread" disabled={isActionLoading} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100/50 rounded-md" onClick={() => handleDeleteClick(thread)}><Trash2 size={16} /></button>
                                                    </div> )}
                                                </div>
                                                <p className="text-gray-700 mt-2 text-sm line-clamp-3">{thread.content}</p>
                                                {thread.imageUrl && ( <div className="mt-3 max-w-xs"><img src={thread.imageUrl} alt="Thread attachment" className="rounded-md max-h-48 object-contain border bg-gray-100" onError={(e) => (e.currentTarget.style.display = 'none')}/></div> )}
                                                <div className="mt-3 pt-3 flex items-center justify-between border-t border-purple-200/30">
                                                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                        {thread.category}
                                                    </span>
                                                    <button onClick={() => toggleShowComments(thread.id)} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium" aria-label={thread.showComments ? "Hide comments" : "Show comments"}>
                                                        <MessageCircle size={16} className={thread.showComments ? 'text-purple-700 fill-purple-100' : ''} />
                                                        {/* Displaying direct comments count based on backend DTO */}
                                                        <span>{thread.commentsCount} Comment{thread.commentsCount !== 1 ? 's' : ''}</span>
                                                    </button>
                                                </div>
                                                {thread.showComments && ( <div className="mt-3 pt-3 border-t border-purple-200/30"> <CommentSection threadId={thread.id} currentUserId={user?.id ?? null} /></div> )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && ( <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3"> <button onClick={handlePreviousPage} disabled={currentPage <= 1 || isLoading || isActionLoading} className="w-full sm:w-auto px-4 py-2 bg-white/90 text-[#52007C] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-1 font-nunito transition-colors"><ChevronLeft className="h-4 w-4" /> Previous</button><span className="text-sm text-white/80 font-nunito order-first sm:order-none">Page {currentPage} of {totalPages} <span className='hidden sm:inline'> ({totalThreads} threads)</span></span><button onClick={handleNextPage} disabled={currentPage >= totalPages || isLoading || isActionLoading} className="w-full sm:w-auto px-4 py-2 bg-white/90 text-[#52007C] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-1 font-nunito transition-colors">Next <ChevronRight className="h-4 w-4" /></button></div> )}
                     </>
                   )}
                </div>

                {/* Modals */}
                <CreateThreadModal 
                    isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} 
                    onSubmit={handleCreateThread} 
                    availableCategories={courseCategories.map(cat => cat.title)} />
                {editModalInitialData && threadToEdit && (
                    <EditThreadModal 
                        isOpen={isEditModalOpen} 
                        onClose={() => {setIsEditModalOpen(false); setThreadToEdit(null);}} 
                        onSubmit={handleUpdateThread} 
                        initialData={editModalInitialData}
                        availableCategories={courseCategories.map(cat => cat.title)} />
                )}
                {threadToDelete && (
                    <DeleteItemDialog 
                        isOpen={isDeleteDialogOpen} 
                        onClose={() => {setIsDeleteDialogOpen(false); setThreadToDelete(null);}} 
                        onConfirm={handleDeleteConfirm} itemName="thread" 
                        itemContentPreview={threadToDelete.title} />
                )}
            </div>
        </Layout>
    );
};

export default DiscussionForum;