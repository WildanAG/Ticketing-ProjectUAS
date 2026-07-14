'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListPending = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openId, setOpenId] = useState(null);   // accordion yang sedang terbuka
    const [processing, setProcessing] = useState(null); // id yang sedang diproses

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/api/users/pending');
            setData(response.data);
        } catch (err) {
            console.error('Error fetching pending:', err);
            setError('Gagal memuat data pending organizer.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleToggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    const handleAction = async (id, action) => {
        // action: 'approve' | 'reject'
        try {
            setProcessing(id);
            await axios.patch(`http://localhost:3001/api/users/${id}/${action}`);
            alert(action === 'approve'
                ? 'Organizer berhasil disetujui! Email telah dikirim.'
                : 'Organizer berhasil ditolak.');
            fetchPending(); // refresh list
        } catch (err) {
            console.error(`Gagal ${action}:`, err);
            alert(err.response?.data?.message || `Gagal melakukan ${action}.`);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className='text-center py-10 text-[#031F40]'>Memuat data...</div>;
    if (error) return <div className='text-center py-10 text-red-500'>{error}</div>;
    if (data.length === 0) return <div className='text-center py-10 text-gray-400'>Tidak ada permintaan pending.</div>;

    return (
        <div className='flex flex-col gap-3 w-full'>
            {data.map((item) => {
                const isOpen = openId === item.user_id;
                const isProcessing = processing === item.user_id;

                return (
                    <div key={item.user_id} className='rounded-xl overflow-hidden shadow-sm border border-gray-200'>
                        {/* Header accordion */}
                        <div className='flex items-center justify-between bg-[#031F40] px-4 py-3 cursor-pointer'
                            onClick={() => handleToggle(item.user_id)}>
                            <div className='flex items-center gap-3'>
                                <span className='text-white text-lg'>
                                    {isOpen ? '▼' : '▶'}
                                </span>
                                <span className='text-white font-semibold text-sm md:text-base'>
                                    Request from {item.username}
                                </span>
                            </div>

                            {/* Tombol approve & reject */}
                            <div className='flex gap-2' onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => handleAction(item.user_id, 'approve')}
                                    disabled={isProcessing}
                                    className='bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-md px-3 py-1 text-sm font-bold transition-colors'
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => handleAction(item.user_id, 'reject')}
                                    disabled={isProcessing}
                                    className='bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-md px-3 py-1 text-sm font-bold transition-colors'
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Isi dropdown */}
                        {isOpen && (
                            <div className='bg-[#f0f4f8] px-6 py-4 flex flex-col gap-2 text-[#031F40] text-sm'>
                                <div className='flex gap-2'>
                                    <span className='w-32 font-semibold'>Organization</span>
                                    <span>: {item.username}</span>
                                </div>
                                <div className='flex gap-2 items-center'>
                                    <span className='w-32 font-semibold'>Organizers CV</span>
                                    <span>: </span>
                                    {item.cv ? (
                                        <a
                                            href={`http://localhost:3001${item.cv}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-600 underline flex items-center gap-1'
                                        >
                                            📄 {item.username} - CV
                                        </a>
                                    ) : (
                                        <span className='text-gray-400'>Tidak ada CV</span>
                                    )}
                                </div>
                                <div className='flex gap-2'>
                                    <span className='w-32 font-semibold'>Email</span>
                                    <span>: {item.email}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <span className='w-32 font-semibold'>Number</span>
                                    <span>: {item.number}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <span className='w-32 font-semibold'>Social Links</span>
                                    <span>: {item.socialmedia || '-'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ListPending;