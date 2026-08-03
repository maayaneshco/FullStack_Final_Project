import { useEffect, useMemo, useState } from "react";
import { Download, Edit3, FileText, Plus, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearProtocolErrors,
    createProtocol,
    deleteProtocol,
    fetchProtocols,
    updateProtocol,
} from "../../redux/slices/protocolSlice";
import protocolService from "../../services/protocolService";

const emptyForm = {
    title: "",
    description: "",
    category: "general",
    file: null,
};

const categories = [
    "molecular_biology",
    "cell_culture",
    "histology",
    "animal_work",
    "imaging",
    "general",
];

const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSize = 10 * 1024 * 1024;

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const formatDate = (value) => {
    if (!value) {
        return "No date";
    }

    return new Date(value).toLocaleDateString();
};

const formatFileSize = (size) => {
    if (!size && size !== 0) {
        return "Unknown size";
    }

    if (size < 1024 * 1024) {
        return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getUserName = (user) => {
    if (!user || typeof user === "string") {
        return user || "Unknown user";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const buildFormState = (protocol) => ({
    title: protocol?.title || "",
    description: protocol?.description || "",
    category: protocol?.category || "general",
    file: null,
});

const ProtocolsPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { protocols, loading, error, actionLoading, actionError } =
        useSelector((state) => state.protocols);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [titleFilter, setTitleFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [downloadLoadingId, setDownloadLoadingId] = useState("");
    const [downloadError, setDownloadError] = useState("");

    const isAdmin = user?.role === "admin";

    const fetchFilters = useMemo(
        () => ({
            title: titleFilter.trim() || undefined,
            category: categoryFilter === "all" ? undefined : categoryFilter,
        }),
        [titleFilter, categoryFilter]
    );

    useEffect(() => {
        dispatch(fetchProtocols(fetchFilters));

        return () => {
            dispatch(clearProtocolErrors());
        };
    }, [dispatch, fetchFilters]);

    const openCreateForm = () => {
        setEditingProtocol(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        setDownloadError("");
        dispatch(clearProtocolErrors());
    };

    const openEditForm = (protocol) => {
        setEditingProtocol(protocol);
        setFormData(buildFormState(protocol));
        setFormError("");
        setIsFormOpen(true);
        setDownloadError("");
        dispatch(clearProtocolErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingProtocol(null);
        setFormData(emptyForm);
        setFormError("");
    };

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: files ? files[0] || null : value,
        }));
    };

    const validateFile = () => {
        if (editingProtocol) {
            return "";
        }

        if (!formData.file) {
            return "Protocol file is required.";
        }

        if (!allowedFileTypes.includes(formData.file.type)) {
            return "Only PDF, DOC and DOCX files are allowed.";
        }

        if (formData.file.size > maxFileSize) {
            return "Protocol file must be 10MB or smaller.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            setFormError("Title is required.");
            return;
        }

        const fileError = validateFile();

        if (fileError) {
            setFormError(fileError);
            return;
        }

        const result = editingProtocol
            ? await dispatch(
                  updateProtocol({
                      protocolId: editingProtocol._id,
                      protocolData: {
                          title: formData.title.trim(),
                          description: formData.description.trim(),
                          category: formData.category,
                      },
                  })
              )
            : await dispatch(createProtocol(buildUploadFormData()));

        if (
            createProtocol.fulfilled.match(result) ||
            updateProtocol.fulfilled.match(result)
        ) {
            closeForm();
            dispatch(fetchProtocols(fetchFilters));
        }
    };

    const buildUploadFormData = () => {
        const uploadData = new FormData();

        uploadData.append("title", formData.title.trim());
        uploadData.append("description", formData.description.trim());
        uploadData.append("category", formData.category);
        uploadData.append("file", formData.file);

        return uploadData;
    };

    const handleDelete = async (protocol) => {
        const confirmed = window.confirm(
            `Delete "${protocol.title}"? This will mark it inactive.`
        );

        if (!confirmed) {
            return;
        }

        await dispatch(deleteProtocol(protocol._id));
    };

    const handleDownload = async (protocol) => {
        try {
            setDownloadError("");
            setDownloadLoadingId(protocol._id);

            const { blob, fileName } =
                await protocolService.downloadProtocol(protocol);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (downloadFailure) {
            setDownloadError(
                downloadFailure.response?.data?.message ||
                    downloadFailure.message ||
                    "Failed to download protocol"
            );
        } finally {
            setDownloadLoadingId("");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Lab documents
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Protocol Library
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Upload, browse, update, and download active lab
                        protocol files.
                    </p>
                </div>

                <Button onClick={openCreateForm} className="gap-2">
                    <Plus size={18} />
                    Upload Protocol
                </Button>
            </div>

            <Card className="space-y-4">
                <Input
                    label="Filter by title"
                    value={titleFilter}
                    onChange={(event) => setTitleFilter(event.target.value)}
                    placeholder="Search protocol title"
                />

                <div className="flex flex-wrap gap-2">
                    {["all", ...categories].map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setCategoryFilter(category)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                                categoryFilter === category
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                            }`}
                        >
                            {formatLabel(category)}
                        </button>
                    ))}
                </div>
            </Card>

            {isFormOpen && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">
                            {editingProtocol
                                ? "Edit Protocol Metadata"
                                : "Upload Protocol"}
                        </h2>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close protocol form"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {(formError || actionError) && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError || actionError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Protocol title"
                            />

                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {formatLabel(category)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Protocol summary"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>

                        {!editingProtocol && (
                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Protocol File
                                </label>
                                <input
                                    name="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Accepted: PDF, DOC, DOCX. Maximum size: 10MB.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeForm}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading
                                    ? "Saving..."
                                    : editingProtocol
                                      ? "Save Changes"
                                      : "Upload Protocol"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {(error || downloadError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error || downloadError}
                </div>
            )}

            {loading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading protocols...
                    </p>
                </Card>
            ) : protocols.length === 0 ? (
                <Card className="text-center">
                    <FileText
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No protocols found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Upload a protocol or adjust the filters.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {protocols.map((protocol) => (
                        <Card key={protocol._id} className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-semibold">
                                            {protocol.title}
                                        </h2>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                            {formatLabel(protocol.category)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {protocol.description || "No description."}
                                    </p>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(protocol)}
                                        disabled={
                                            downloadLoadingId === protocol._id
                                        }
                                        className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-primary)] hover:border-[var(--color-primary)] disabled:opacity-60"
                                        aria-label={`Download ${protocol.title}`}
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEditForm(protocol)}
                                        className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                        aria-label={`Edit ${protocol.title}`}
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(protocol)}
                                            disabled={actionLoading}
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-60"
                                            aria-label={`Delete ${protocol.title}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        File
                                    </p>
                                    <p className="break-all">
                                        {protocol.originalFileName}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Type
                                    </p>
                                    <p>{protocol.fileType}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Size
                                    </p>
                                    <p>{formatFileSize(protocol.fileSize)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Uploaded
                                    </p>
                                    <p>{formatDate(protocol.createdAt)}</p>
                                </div>
                            </div>

                            <div className="text-sm text-[var(--color-text-secondary)]">
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    Uploaded By
                                </p>
                                <p>{getUserName(protocol.uploadedBy)}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProtocolsPage;
