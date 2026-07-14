'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../atoms/button';

const ListOrganizer = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchOrganizers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/api/users/organizers');
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Gagal memuat data event organizer.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizers();
    }, []);

    const handleUpdateStatus = async (statusAction) => {
        if (!selectedId) {
            alert('Silakan pilih salah satu organizer terlebih dahulu dengan mengklik baris tabel.');
            return;
        }

        try {
            setUpdating(true);
            await axios.patch(`http://localhost:3001/api/users/${selectedId}`, {
                status: statusAction
            });
            alert(`Organizer berhasil di-${statusAction}!`);
            setSelectedId(null);
            fetchOrganizers();
        } catch (err) {
            console.error(`Gagal melakukan ${statusAction}:`, err);
            const message = err.response?.status === 404
                ? 'Organizer tidak ditemukan atau sudah dihapus.'
                : `Gagal mengubah status organizer menjadi ${statusAction}.`;
            alert(message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className='w-full text-center py-10 font-medium text-[#031F40]'>
                Memuat data...
            </div>
        );
    }
    if (error) {
        return (
            <div className='w-full text-center py-10 font-medium text-red-500'>
                {error}
            </div>
        );
    }

    return (
        <div>
            <div className='w-full max-h-125 overflow-y-auto overflow-x-auto bg-[#fafafa] rounded-xl shadow-sm custom-scrollbar'>
                <table className='w-full text-left border-collapse'>
                    <thead className='sticky top-0 z-10 bg-[#031F40]'>
                        <tr className='bg-[#031F40] text-white'>
                            <th className='p-2 font-semibold text-sm rounded-l-lg md:p-4 md:text-lg'>No</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>ID</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Username</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Email</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Number</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Join Date</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>CV</th>
                            <th className='p-2 font-semibold text-sm rounded-r-lg md:p-4 md:text-lg'>Status</th>
                        </tr>
                    </thead>

                    <tbody className='text-[#031F40] bg-[#fafafa] font-semi text-sm'>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan='8' className='text-center p-8 text-gray-400'>
                                    Tidak ada data event organizer.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const isSelected = selectedId === item.user_id;
                                return (
                                    <tr
                                        key={item.user_id}
                                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 hover:bg-blue-200 font-bold' : 'hover:bg-slate-200'}`}
                                        onClick={() => setSelectedId(item.user_id)}
                                    >
                                        <td className='p-4 py-5 align-middle'>{index + 1}.</td>
                                        <td className='p-4 py-5 align-middle'>{item.user_id}</td>
                                        <td className='p-4 py-5 align-middle'>{item.username}</td>
                                        <td className='p-4 py-5 align-middle'>{item.email}</td>
                                        <td className='p-4 py-5 align-middle'>{item.number}</td>
                                        <td className='p-4 py-5 align-middle'>{item.join_date}</td>
                                        <td className='p-4 py-5 align-middle'>
                                            {item.cv ? (
                                                <a
                                                    href={`http://localhost:3001${item.cv}`}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-600 underline hover:text-blue-800 text-sm'
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📄 Lihat CV
                                                </a>
                                            ) : (
                                                <span className='text-gray-400 text-sm'>-</span>
                                            )}
                                        </td>
                                        <td className='p-4 py-5 align-middle font-bold'>{item.status}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className='flex flex-row justify-center mt-4 gap-4 md:justify-end'>
                <Button text='Active' className='bg-[#30E630]' onClick={() => handleUpdateStatus('active')} disabled={updating || !selectedId}/>
                <Button text='Suspend' className='bg-[#031F40]' onClick={() => handleUpdateStatus('suspend')} disabled={updating || !selectedId}/>
                <Button text='Banned' className='bg-[#DA4545]' onClick={() => handleUpdateStatus('banned')} disabled={updating || !selectedId}/>
            </div>
        </div>
    );
};

export default ListOrganizer;