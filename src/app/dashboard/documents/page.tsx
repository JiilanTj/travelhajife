'use client';
import { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEye, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { Document, DocumentType } from '@/types/document';
import { getMyDocuments, uploadDocument, deleteDocument } from '@/services/document';

interface DocumentTypeConfig {
  id: DocumentType;
  label: string;
  requireNumber: boolean;
  requireExpiry: boolean;
}

const documentTypes: DocumentTypeConfig[] = [
  { id: 'KTP', label: 'KTP', requireNumber: true, requireExpiry: false },
  { id: 'PASSPORT', label: 'Paspor', requireNumber: true, requireExpiry: true },
  { id: 'KK', label: 'Kartu Keluarga', requireNumber: true, requireExpiry: false },
  { id: 'FOTO', label: 'Pas Foto', requireNumber: false, requireExpiry: false },
  { id: 'VAKSIN', label: 'Sertifikat Vaksin', requireNumber: true, requireExpiry: false },
  { id: 'BUKU_NIKAH', label: 'Buku Nikah', requireNumber: true, requireExpiry: false },
  { id: 'IJAZAH', label: 'Ijazah', requireNumber: true, requireExpiry: false }
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type: DocumentType, file: File, number?: string, expiryDate?: string) => {
    try {
      setUploadingDoc(type);
      await uploadDocument(type, file, number, expiryDate);
      toast.success('Dokumen berhasil diunggah');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Gagal mengunggah dokumen');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Dokumen yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await deleteDocument(id);
        toast.success('Dokumen berhasil dihapus');
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Gagal menghapus dokumen');
      }
    }
  };

  const handleFileChange = async (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docType = documentTypes.find(d => d.id === type);
    if (!docType) return;

    if (docType.requireNumber || docType.requireExpiry) {
      const { value: formValues } = await Swal.fire({
        title: `Upload ${docType.label}`,
        html: `
          ${docType.requireNumber ? `
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nomor ${docType.label}</label>
              <input id="number" class="w-full px-3 py-2 border rounded-lg" placeholder="Masukkan nomor dokumen">
            </div>
          ` : ''}
          ${docType.requireExpiry ? `
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Kadaluarsa</label>
              <input id="expiry" type="date" class="w-full px-3 py-2 border rounded-lg">
            </div>
          ` : ''}
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Upload',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const number = docType.requireNumber ? (document.getElementById('number') as HTMLInputElement).value : undefined;
          const expiry = docType.requireExpiry ? (document.getElementById('expiry') as HTMLInputElement).value : undefined;
          
          if (docType.requireNumber && !number) {
            Swal.showValidationMessage(`Nomor ${docType.label} harus diisi`);
            return false;
          }
          
          return { number, expiry };
        }
      });

      if (formValues) {
        await handleFileUpload(type, file, formValues.number, formValues.expiry);
      }
    } else {
      await handleFileUpload(type, file);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Terverifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaSpinner className="w-3 h-3 mr-1 animate-spin" />
            Menunggu
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-6">
          {/* Header dengan gradient */}
          <div className="relative mb-8 p-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            <div className="relative">
              <h1 className="text-2xl font-semibold text-white mb-2">Dokumen Saya</h1>
              <p className="text-green-50">Kelola dokumen persyaratan umrah dan haji Anda</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentTypes.map((docType) => {
                const existingDoc = documents.find(d => d.type === docType.id);
                
                return (
                  <div key={docType.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {existingDoc ? (
                      <div>
                        {/* Preview Area */}
                        <div className="relative h-48 w-full bg-gray-100">
                          {existingDoc.file.url.toLowerCase().endsWith('.pdf') ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-500">PDF Document</span>
                            </div>
                          ) : (
                            <Image
                              src={existingDoc.file.url}
                              alt={docType.label}
                              fill
                              className="object-cover"
                            />
                          )}
                          
                          {/* Action buttons */}
                          <div className="absolute top-2 right-2 flex gap-2">
                            <a
                              href={existingDoc.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700 hover:text-blue-600 shadow-sm backdrop-blur-sm transition-all duration-200"
                            >
                              <FaEye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(existingDoc.id)}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700 hover:text-red-600 shadow-sm backdrop-blur-sm transition-all duration-200"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Document Info */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">{docType.label}</h3>
                            {getStatusBadge(existingDoc.status)}
                          </div>
                          
                          {existingDoc.number && (
                            <p className="text-sm text-gray-600 mb-1">
                              Nomor: {existingDoc.number}
                            </p>
                          )}
                          
                          {existingDoc.expiryDate && (
                            <p className="text-sm text-gray-600 mb-1">
                              Kadaluarsa: {new Date(existingDoc.expiryDate).toLocaleDateString('id-ID')}
                            </p>
                          )}

                          {existingDoc.status === 'REJECTED' && existingDoc.rejectionReason && (
                            <p className="mt-2 text-sm text-red-600">
                              Alasan: {existingDoc.rejectionReason}
                            </p>
                          )}

                          {/* Upload new version */}
                          <label className="mt-3 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileChange(docType.id, e)}
                              disabled={!!uploadingDoc}
                            />
                            {uploadingDoc === docType.id ? (
                              <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FaUpload className="w-4 h-4 mr-2" />
                            )}
                            Upload Ulang
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Upload Area */}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{docType.label}</h3>
                          <label className="flex flex-col items-center justify-center h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {uploadingDoc === docType.id ? (
                                <FaSpinner className="w-8 h-8 text-gray-400 animate-spin" />
                              ) : (
                                <>
                                  <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PDF, PNG, atau JPG (max. 5MB)
                                  </p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileChange(docType.id, e)}
                              disabled={!!uploadingDoc}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 