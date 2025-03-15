import React, { useState } from 'react';
import { MessageSquare, Search, Plus, Clock, MessageCircle, Edit2, Trash2, Eye } from 'lucide-react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout';
import CreateThreadModal from './components/CreateThreadModal';
import EditThreadModal from './components/EditThreadModal';
import { Thread, ThreadFormData } from './types/thread';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import MyThreadsButton from './components/MyThreadsButton';

const DiscussionForum: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showMyThreads, setShowMyThreads] = useState(false);

    const categories = [
        'Software Engineering', 'Quality Assurance', 'Project Management',
        'DevOps', 'UI/UX Design', 'Data Science', 'Cloud Computing', 'Cyber Security'
    ];

    const [threads, setThreads] = useState<Thread[]>([
        {
            id: '1',
            title: 'Best practices for code reviews in agile teams',
            category: 'Software Engineering',
            content: 'Discussion about implementing effective code review processes in agile development teams...',
            timestamp: '2 hours ago',
            commentsCount: 23,
            authorName: 'Anna Morrish',
            authorAvatar: '/avatars/anna.jpg',
            image: '/thread-images/code-review.jpg',
            isCurrentUser: false
        },
        {
            id: '2',
            title: 'Implementing test automation for complex applications',
            category: 'Quality Assurance',
            content: 'Deep dive into strategies for implementing automated testing in complex software applications...',
            timestamp: '3 hours ago',
            commentsCount: 15,
            authorName: 'Current User',
            authorAvatar: '/avatars/default.jpg',
            isCurrentUser: true
        },
        {
            id: '3',
            title: 'Agile vs Waterfall: Choosing the right methodology',
            category: 'Project Management',
            content: 'A comparative analysis of Agile and Waterfall methodologies and when to use each approach...',
            timestamp: '1 day ago',
            commentsCount: 8,
            authorName: 'John Smith',
            authorAvatar: '/avatars/john.jpg',
            isCurrentUser: false
        },
        {
            id: '4',
            title: 'Modern UI design patterns for enterprise applications',
            category: 'UI/UX Design',
            content: 'Exploring the latest UI design patterns that improve user experience in enterprise web applications...',
            timestamp: '4 hours ago',
            commentsCount: 12,
            authorName: 'Current User',
            authorAvatar: '/avatars/default.jpg',
            isCurrentUser: true
        },
        {
            id: '5',
            title: 'Securing cloud infrastructure in multi-tenant environments',
            category: 'Cyber Security',
            content: 'Best practices for securing cloud infrastructure in environments with multiple tenants...',
            timestamp: '2 days ago',
            commentsCount: 19,
            authorName: 'Sarah Johnson',
            authorAvatar: '/avatars/sarah.jpg',
            isCurrentUser: false
        }
    ]);

    const handleCreateThread = (threadData: ThreadFormData) => {
        const newThread: Thread = {
            id: Date.now().toString(),
            title: threadData.title,
            category: threadData.category,
            content: threadData.content,
            image: threadData.imagePreview,
            timestamp: 'Just now',
            commentsCount: 0,
            authorName: 'Current User',
            authorAvatar: '/avatars/default.jpg',
            isCurrentUser: true
        };
        setThreads([newThread, ...threads]);
        setIsCreateModalOpen(false);
    };

    const handleEditThread = (thread: Thread) => {
        const initialData: ThreadFormData = {
            title: thread.title,
            content: thread.content,
            category: thread.category,
            image: null,
            imagePreview: thread.image
        };

        setSelectedThread(thread);
        setIsEditModalOpen(true);
    };

    const handleUpdateThread = (updatedData: ThreadFormData) => {
        if (selectedThread) {
            setThreads(threads.map(thread =>
                thread.id === selectedThread.id
                    ? {
                        ...thread,
                        title: updatedData.title,
                        content: updatedData.content,
                        category: updatedData.category,
                        image: updatedData.imagePreview
                    }
                    : thread
            ));
        }
        setIsEditModalOpen(false);
        setSelectedThread(null);
    };

    const handleDeleteClick = (thread: Thread) => {
        setSelectedThread(thread);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedThread) {
            setThreads(threads.filter(thread => thread.id !== selectedThread.id));
        }
        setIsDeleteDialogOpen(false);
        setSelectedThread(null);
    };

    const filteredThreads = threads.filter(thread => {
        const matchesSearch =
            thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            thread.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || thread.category === categoryFilter;
        const matchesAuthor = !showMyThreads || thread.isCurrentUser;

        return matchesSearch && matchesCategory && matchesAuthor;
    });

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C]">
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
                                Discussion Forum
                            </h1>
                            <p className="text-[#D68BF9] text-lg font-nunito">
                                Connect and learn with your peers
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <MyThreadsButton
                                onClick={() => setShowMyThreads(!showMyThreads)}
                                active={showMyThreads}
                            />
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-xl hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 flex items-center gap-2 font-nunito shadow-md"
                            >
                                <Plus className="h-5 w-5" />
                                Create Thread
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#52007C]" />
                                <input
                                    type="text"
                                    placeholder="Search threads..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl pl-12 pr-4 py-3 text-[#1B0A3F] placeholder-[#52007C]/60 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl px-4 py-3 text-[#1B0A3F] min-w-[150px] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredThreads.length > 0 ? (
                            filteredThreads.map(thread => (
                                <div
                                    key={thread.id}
                                    className="bg-white/95 backdrop-blur-sm rounded-lg border border-[#BF4BF6]/20 shadow-sm overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center text-white font-bold text-sm shadow-md font-nunito">
                                                {thread.authorName.charAt(0)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-medium text-[#1B0A3F] font-unbounded truncate">
                                                            {thread.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[#52007C] font-nunito text-xs">
                                                                {thread.authorName}
                                                            </span>
                                                            <span className="text-[#52007C]/60 flex items-center gap-1 font-nunito text-xs">
                                                                <Clock className="h-3 w-3" />
                                                                {thread.timestamp}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {thread.isCurrentUser && (
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <button
                                                                className="p-1.5 text-[#52007C] hover:bg-[#F6E6FF] rounded-md transition-colors"
                                                                onClick={() => handleEditThread(thread)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="p-1.5 text-[#52007C] hover:bg-red-50 hover:text-red-400 rounded-md transition-colors"
                                                                onClick={() => handleDeleteClick(thread)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-[#52007C]/80 mt-1.5 font-nunito line-clamp-2 text-sm">
                                                    {thread.content}
                                                </p>

                                                {thread.image && (
                                                    <img
                                                        src={thread.image}
                                                        alt={thread.title}
                                                        className="mt-2 rounded-md max-h-32 object-cover w-full"
                                                    />
                                                )}

                                                <div className="mt-2 flex items-center gap-3">
                                                    <span className="px-2 py-0.5 bg-[#F6E6FF] text-[#52007C] rounded-full text-xs font-nunito border border-[#BF4BF6]/20">
                                                        {thread.category}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setThreads(threads.map(t =>
                                                                t.id === thread.id
                                                                    ? { ...t, showComments: !t.showComments }
                                                                    : t
                                                            ));
                                                        }}
                                                        className="flex items-center gap-1 text-[#52007C] hover:text-[#BF4BF6] font-nunito text-xs transition-colors"
                                                        aria-label={thread.showComments ? "Hide comments" : "Show comments"}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>{thread.commentsCount}</span>
                                                    </button>
                                                </div>

                                                {thread.showComments && (
                                                    <div className="border-t border-[#BF4BF6]/20 mt-4 pt-4">
                                                        <CommentSection threadId={thread.id} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#BF4BF6]/20 p-8 text-center">
                                <MessageSquare className="h-12 w-12 text-[#BF4BF6] mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-[#1B0A3F] mb-2 font-unbounded">
                                    No threads found
                                </h3>
                                <p className="text-[#52007C]/80 font-nunito">
                                    {showMyThreads
                                        ? "You haven't created any threads yet. Start a discussion by clicking 'Create Thread'!"
                                        : "No threads match your search criteria. Try adjusting your filters or create a new thread!"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <CreateThreadModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateThread}
                />

                {selectedThread && (
                    <EditThreadModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedThread(null);
                        }}
                        onSubmit={handleUpdateThread}
                        initialData={{
                            title: selectedThread.title,
                            content: selectedThread.content,
                            category: selectedThread.category,
                            image: null,
                            imagePreview: selectedThread.image
                        }}
                    />
                )}

                {selectedThread && (
                    <DeleteConfirmationDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={() => {
                            setIsDeleteDialogOpen(false);
                            setSelectedThread(null);
                        }}
                        onConfirm={handleDeleteConfirm}
                        threadTitle={selectedThread.title}
                    />
                )}
            </div>
        </Layout>
    );
};

export default DiscussionForum;