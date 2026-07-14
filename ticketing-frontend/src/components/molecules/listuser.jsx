'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../atoms/button';

const ListUser = ({ search }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/api/users');
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Gagal memuat data users.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getUserId = (item) => item.user_id ?? item.id;

    const handleUpdateStatus = async (statusAction) => {
        if (!selectedId) {
            alert('Silakan pilih salah satu user terlebih dahulu dengan mengklik baris tabel.');
            return;
        }

        try {
            setUpdating(true);
            await axios.patch(`http://localhost:3001/api/users/${selectedId}`, {
                status: statusAction
            });
            alert(`User berhasil di-${statusAction}!`);
            setSelectedId(null);
            fetchUsers();
        } catch (err) {
            console.error(`Gagal melakukan ${statusAction}:`, err);
            const message = err.response?.status === 404
                ? 'User tidak ditemukan atau sudah dihapus.'
                : `Gagal mengubah status user menjadi ${statusAction}.`;
            alert(message);
        } finally {
            setUpdating(false);
        }
    }

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
                        <tr className='bg-[#031F40] text-white rounded-lg'>
                            <th className='p-2 font-semibold text-sm rounded-l-lg md:p-4 md:text-lg'>No</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Name Users</th>
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Email</th>                        
                            <th className='p-2 font-semibold text-sm md:p-4 md:text-lg'>Registration date</th>
                            <th className='p-2 font-semibold text-sm rounded-r-lg md:p-4 md:text-lg'>Status</th>
                        </tr>
                    </thead>

                    <tbody className='text-[#031F40] bg-[#fafafa] font-semi text-sm'>                    
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan='5' className='text-center p-8 text-gray-400'>
                                    Tidak ada data user.
                                </td>
                            </tr>
                        ) : (                        
                            data.map((item, index) => {                                
                                const itemId = getUserId(item);
                                const isSelected = selectedId === itemId;
                                return (
                                    <tr 
                                        key={itemId || index} 
                                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 hover:bg-blue-200 font-bold' : 'hover:bg-slate-200'}`} 
                                        onClick={() => setSelectedId(itemId)}
                                    >
                                        <td className='p-4 py-5 align-middle'>{index + 1}.</td>
                                        <td className='p-4 py-5 align-middle'>{item.username}</td>
                                        <td className='p-4 py-5 align-middle'>{item.email}</td>                                
                                        <td className='p-4 py-5 align-middle'>{item.join_date}</td>
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
}

export default ListUser;