'use client'
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IoCloudUpload } from 'react-icons/io5';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        event_title: '', event_date: '', event_location: '',
        event_description: '', ticket_start: '', ticket_ends: '', max_capacity: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const reset = () => {
        setFormData({ event_title: '', event_date: '', event_location: '', event_description: '', ticket_start: '', ticket_ends: '', max_capacity: '' });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.event_title.trim())
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Judul event wajib diisi.', confirmButtonColor: '#031F40' });
        if (!formData.event_date)
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Tanggal event wajib diisi.', confirmButtonColor: '#031F40' });
        if (!formData.event_location.trim())
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Lokasi event wajib diisi.', confirmButtonColor: '#031F40' });
        if (!formData.max_capacity || formData.max_capacity <= 0)
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Kapasitas wajib diisi dan lebih dari 0.', confirmButtonColor: '#031F40' });
        if (!imageFile)
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Gambar event wajib diunggah.', confirmButtonColor: '#031F40' });

        try {
            setLoading(true);
            const payload = new FormData();
            Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
            payload.append('image', imageFile);

            await axios.post('http://localhost:3001/api/events', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            await Swal.fire({
                icon: 'success',
                title: 'Event Berhasil Dibuat!',
                text: 'Silakan cek My Events untuk mengelolanya.',
                confirmButtonColor: '#031F40',
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false
            });

            reset();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Membuat Event',
                text: err.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.',
                confirmButtonColor: '#031F40'
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C345] text-[#031F40]';
    const labelClass = 'block text-sm font-semibold text-slate-700 mb-2';

    return (
        <div className='bg-white rounded-3xl shadow-xl border border-slate-200'>
            <div className='p-6 md:p-8'>
                <h2 className='text-2xl font-bold text-[#031F40] mb-1'>Create Event</h2>
                <p className='text-sm text-gray-500 mb-6'>Isi detail event dan unggah gambar.</p>

                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6'>

                        <div className='flex flex-col gap-4'>
                            <label htmlFor='imageInput' className='cursor-pointer w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[#F5C345] transition flex items-center justify-center'>
                                {imagePreview ? (
                                    <img src={imagePreview} alt='preview' className='w-full h-full object-cover'/>
                                ) : (
                                    <div className='text-center px-4'>
                                        <IoCloudUpload className='mx-auto text-4xl text-gray-400 mb-2'/>
                                        <p className='text-sm font-semibold text-gray-600'>Klik untuk upload gambar</p>
                                        <p className='text-xs text-gray-400 mt-1'>JPG, PNG, WEBP — maks 5MB</p>
                                    </div>
                                )}
                            </label>
                            <input id='imageInput' type='file' accept='image/*' onChange={handleImageChange} className='hidden'/>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <label className={labelClass}>Judul Event <span className='text-red-500'>*</span></label>
                                <input type='text' name='event_title' value={formData.event_title} onChange={handleChange} placeholder='Contoh: Konser Paramore 2026' className={inputClass}/>
                            </div>
                            <div>
                                <label className={labelClass}>Deskripsi Event</label>
                                <textarea name='event_description' value={formData.event_description} onChange={handleChange} placeholder='Jelaskan detail event...' rows='3' className={`${inputClass} resize-none`}/>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className={labelClass}>Lokasi <span className='text-red-500'>*</span></label>
                                    <input type='text' name='event_location' value={formData.event_location} onChange={handleChange} placeholder='Kota Bogor, Jawa Barat' className={inputClass}/>
                                </div>
                                <div>
                                    <label className={labelClass}>Tanggal Event <span className='text-red-500'>*</span></label>
                                    <input type='datetime-local' name='event_date' value={formData.event_date} onChange={handleChange} className={inputClass}/>
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className={labelClass}>Ticket Start Date</label>
                                    <input type='datetime-local' name='ticket_start' value={formData.ticket_start} onChange={handleChange} className={inputClass}/>
                                </div>
                                <div>
                                    <label className={labelClass}>Ticket End Date</label>
                                    <input type='datetime-local' name='ticket_ends' value={formData.ticket_ends} onChange={handleChange} className={inputClass}/>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Kapasitas Maksimal <span className='text-red-500'>*</span></label>
                                <input type='number' name='max_capacity' value={formData.max_capacity} onChange={handleChange} placeholder='Contoh: 1000' min='1' className={inputClass}/>
                            </div>
                            <div className='flex gap-3 pt-2'>
                                <button type='button' onClick={reset}
                                    className='flex-1 rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition'>
                                    Cancel
                                </button>
                                <button type='submit' disabled={loading}
                                    className='flex-1 rounded-2xl bg-[#F5C345] px-6 py-3 text-sm font-semibold text-[#031F40] hover:bg-yellow-400 transition disabled:opacity-60'>
                                    {loading ? 'Memproses...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;