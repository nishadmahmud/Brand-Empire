"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { uploadReviewMedia, saveProductReview } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { X, Upload, Star, Loader2 } from "lucide-react";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const WriteReviewModal = ({ productId, open, onClose, product }) => {
    const { user, token } = useAuth();
    const { showToast } = useToast();

    // State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files) {
            // Convert FileList to Array and append to existing files
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    // Remove selected file
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Submit Handler
    const handleSubmit = async () => {
        if (!rating) {
            setError("Please select a rating.");
            return;
        }
        if (!comment || comment === "<p><br></p>") {
            setError("Please write a review.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            let uploadedPaths = [];

            // Step 1: Upload Files (if any)
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach((f) => formData.append("pictures[]", f));
                // Assuming user.id or user.customer_id is available. Using user.id based on context.
                formData.append("user_id", user?.customer_id || user?.id);

                const uploadRes = await uploadReviewMedia(formData, token);

                if (uploadRes?.success && Array.isArray(uploadRes.path)) {
                    uploadedPaths = uploadRes.path.map((p) => p.path);
                } else {
                    throw new Error("Failed to upload media. Please try again.");
                }
            }

            // Step 2: Submit Review Data
            const payload = {
                product_id: productId,
                sales_id: null,
                customer_id: user?.customer_id || user?.id,
                rating: rating,
                comment: comment,
                images: uploadedPaths
            };

            const response = await saveProductReview(payload, token);

            if (response.success) {
                showToast("Review submitted successfully!", "success");
                // Reset form
                setRating(0);
                setComment("");
                setFiles([]);
                onClose();
            } else {
                throw new Error(response.message || "Failed to submit review.");
            }

        } catch (err) {
            console.error("Review submission error:", err);
            setError(err.message || "An error occurred. Please try again.");
            showToast(err.message || "Failed to submit review", "error");
        } finally {
            setLoading(false);
        }
    };

    // Close modal if not open
    if (!open) return null;

    // React Quill Modules
    const modules = {
        toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
        ],
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                        <p className="text-sm text-gray-500 mt-1">{product?.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Overall Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                    type="button"
                                >
                                    <Star
                                        size={32}
                                        className={`${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300 fill-gray-100"}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="quill-wrapper">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--brand-royal-red)] focus-within:border-transparent transition-all">
                            <ReactQuill
                                theme="snow"
                                value={comment}
                                onChange={setComment}
                                modules={modules}
                                placeholder="Share your experience with this product..."
                                className="h-40 mb-12" // mb-12 to account for toolbar
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">Min 10 characters</p>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Add Photos & Videos</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                                <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Click to upload images or videos</span>
                                <span className="text-xs text-gray-500">Supports JPG, PNG, MP4</span>
                            </div>
                        </div>

                        {/* File Previews */}
                        {files.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {files.map((file, index) => (
                                    <div key={index} className="relative aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden group">
                                        {file.type.startsWith('video') ? (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                                                Video
                                            </div>
                                        ) : (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-700 font-bold hover:bg-gray-200 rounded transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-[var(--brand-royal-red)] text-white font-bold rounded hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .quill-wrapper .ql-container {
                    border: none !important;
                    font-size: 0.875rem;
                }
                .quill-wrapper .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background: #f9fafb;
                }
                .quill-wrapper .ql-editor {
                    min-height: 160px;
                }
            `}</style>
        </div>
    );
};

export default WriteReviewModal;
