'use client'
import Adminmenu from '@/components/molecules/adminmenu';
import Button from '@/components/atoms/button';
import Searchbar from '@/components/atoms/searchbar';
import Filter from '@/components/atoms/filter';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                // Mengambil data ke endpoint backend
                const response = await axios.get('http://localhost:3001/api/transactions/all');
                
                // Mendukung response.data langsung jika backend mengembalikan array,
                // atau response.data.data jika dibungkus object standar envelopment.
                const dataRaw = response.data?.success ? response.data.data : (Array.isArray(response.data) ? response.data : []);
                
                setTransactions(dataRaw);
                setFilteredTransactions(dataRaw);
            } catch (error) {
                console.error("Gagal mengambil data transaksi via Axios:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Sinkronisasi realtime fitur search bar
    useEffect(() => {
        if (!search.trim()) {
            setFilteredTransactions(transactions);
            return;
        }
        const keyword = search.toLowerCase();
        setFilteredTransactions(
            transactions.filter((trx) => {
                const username = trx.username || trx.user?.username || '';
                const eventName = trx.event || trx.ticket?.event?.event_name || trx.ticket?.event?.event_title || '';
                const trxId = String(trx.transaction_id || '');

                return (
                    username.toLowerCase().includes(keyword) ||
                    eventName.toLowerCase().includes(keyword) ||
                    trxId.toLowerCase().includes(keyword)
                );
            })
        );
    }, [search, transactions]);

    const formatRupiah = (number) => {
        if (!number) return "Rp 0";
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day} - ${month} - ${year}`;
    };

    return (
        <div>
            <Adminmenu />
            <div className='p-4 md:p-8'>
                <div className='flex flex-col gap-2 md:flex-row md:gap-4 mb-6'>                    
                    <div className='flex flex-row gap-2 md:gap-4 flex-1'>                        
                        <div className='flex-1'>
                            <Searchbar value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className='shrink-0 md:w-32'>
                            <Filter />
                        </div>
                    </div>
                </div>

                <div className='overflow-x-auto rounded-lg shadow-sm border border-gray-100'>
                    <table className='w-full text-left border-collapse bg-white text-sm text-gray-700'>
                        <thead className='bg-[#0F2942] text-white font-medium'>
                            <tr>
                                <th scope='col' className='px-6 py-4'>Transaction ID</th>
                                <th scope='col' className='px-6 py-4'>Username</th>
                                <th scope='col' className='px-6 py-4'>Amount</th>
                                <th scope='col' className='px-6 py-4'>Event</th>
                                <th scope='col' className='px-6 py-4'>Date</th>
                                <th scope='col' className='px-6 py-4'>Status</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100 border-t border-gray-100'>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className='text-center py-8 text-gray-500 font-medium'>
                                        Memuat data transaksi...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='text-center py-8 text-gray-500 font-medium'>
                                        Tidak ada data transaksi.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((trx) => {
                                    // Fallback handling properties relasi Sequelize backend
                                    const displayUsername = trx.username || trx.user?.username || "N/A";
                                    const displayAmount = trx.amount || trx.total_prices || 0;
                                    const displayEvent = trx.event || trx.ticket?.event?.event_name || trx.ticket?.event?.event_title || "N/A";
                                    const displayDate = trx.date || trx.order_date;
                                    const displayStatus = trx.status || trx.transaction_status || "PENDING";

                                    return (
                                        <tr key={trx.transaction_id} className='hover:bg-gray-50 font-medium text-[#0F2942] transition'>
                                            <td className='px-6 py-4 font-semibold'>{trx.transaction_id}</td>
                                            <td className='px-6 py-4 text-gray-600'>{displayUsername}</td>
                                            <td className='px-6 py-4'>{formatRupiah(displayAmount)}</td>
                                            <td className='px-6 py-4 text-gray-600 truncate max-w-xs' title={displayEvent}>
                                                {displayEvent}
                                            </td>
                                            <td className='px-6 py-4 text-gray-600'>{formatDate(displayDate)}</td>
                                            <td className='px-6 py-4'>
                                                <span className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm capitalize
                                                    ${displayStatus.toLowerCase() === 'success' ? 'bg-[#2BE638]' : 'bg-[#F2C24B]'}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Orders;