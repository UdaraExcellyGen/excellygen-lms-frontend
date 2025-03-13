import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { ThreadFormData } from '../types/thread';

interface CreateThreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ThreadFormData) => void;
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState<ThreadFormData>({
        title: '',
        content: '',
        category: '',
        image: null,
        imagePreview: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        'Software Engineering', 'Quality Assurance', 'Project Management',
        'DevOps', 'UI/UX Design', 'Data Science', 'Cloud Computing', 'Cyber Security'
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    image: file,
                    imagePreview: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData({
            ...formData,
            image: null,
            imagePreview: ''
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            title: '',
            content: '',
            category: '',
            image: null,
            imagePreview: ''
        });
        onClose();
    };

    const handleClose = () => {
        setFormData({
            title: '',
            content: '',
            category: '',
            image: null,
            imagePreview: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 w-full max-w-2xl rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-unbounded text-[#1B0A3F]">Create New Thread</h2>
                    <button onClick={handleClose} className="text-[#52007C] hover:text-[#BF4BF6]">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[#52007C] font-nunito mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
                                placeholder="Enter thread title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[#52007C] font-nunito mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[#52007C] font-nunito mb-2">Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-lg px-4 py-2 text-[#1B0A3F] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito min-h-[150px]"
                                placeholder="Write your thread content..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[#52007C] font-nunito mb-2">Image (optional)</label>
                            <div className="mt-1 flex items-center gap-4">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#F6E6FF] text-[#52007C] rounded-lg hover:bg-[#F6E6FF]/80 transition-colors font-nunito">
                                    <ImageIcon className="h-5 w-5" />
                                    Choose Image
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {formData.imagePreview && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            {formData.imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={formData.imagePreview}
                                        alt="Preview"
                                        className="max-h-40 rounded-lg object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-100 text-[#52007C] rounded-lg hover:bg-gray-200 transition-colors font-nunito"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito"
                        >
                            Create Thread
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThreadModal;