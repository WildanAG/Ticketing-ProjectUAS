'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Adminmenu from '@/components/molecules/adminmenu';
import Searchbar from '@/components/atoms/searchbar';
import Filter from '@/components/atoms/filter';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SERVER_URL = BASE_URL.replace(/\/api\/?$/, '');

const Events = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${BASE_URL}/events`);
            const data = res.data?.data || [];
            setEvents(data);
            setFilteredEvents(data);
        } catch (err) {
            console.error('Fetch events error:', err);
            setError(err?.response?.data?.message || err.message || 'Gagal mengambil data event.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredEvents(events);
            return;
        }
        const keyword = search.toLowerCase();
        setFilteredEvents(
            events.filter((e) => {
                const organizerName = getOrganizerName(e);
                return (
                    e.event_title?.toLowerCase().includes(keyword) ||
                    organizerName?.toLowerCase().includes(keyword)
                );
            })
        );
    }, [search, events]);

    // Ambil nama organizer, jaga-jaga field-nya bisa "organizer" atau "user"
    // tergantung alias mana yang benar-benar dipakai di response backend.
    const getOrganizerName = (event) => {
        return event.organizer?.username || event.user?.username || null;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd} - ${mm} - ${yyyy}`;
    };

    return (
        <div>
            <Adminmenu />
            <div className='p-4 md:p-8'>
                <div className='flex flex-row gap-2 md:gap-4 mb-4'>
                    <div className='flex-1'>
                        <Searchbar value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className='shrink-0 md:w-32'>
                        <Filter />
                    </div>
                </div>

                <div className='bg-white rounded-2xl overflow-hidden shadow'>
                    <table className='w-full text-left'>
                        <thead className='bg-[#031F40] text-white'>
                            <tr>
                                <th className='py-4 px-6 font-semibold'>No</th>
                                <th className='py-4 px-6 font-semibold'>Image</th>
                                <th className='py-4 px-6 font-semibold'>Event</th>
                                <th className='py-4 px-6 font-semibold'>Event Organizers</th>
                                <th className='py-4 px-6 font-semibold'>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={5} className='text-center py-8 text-gray-400'>
                                        Memuat data event...
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan={5} className='text-center py-8 text-red-500'>
                                        {error}
                                        <button
                                            onClick={fetchEvents}
                                            className='block mx-auto mt-2 text-sm underline text-[#031F40]'
                                        >
                                            Coba lagi
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className='text-center py-8 text-gray-400'>
                                        Belum ada event.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !error &&
                                filteredEvents.map((event, index) => (
                                    <tr
                                        key={event.event_id}
                                        className='border-b last:border-0 hover:bg-gray-50 transition'
                                    >
                                        <td className='py-4 px-6 text-[#031F40] font-medium'>
                                            {index + 1}.
                                        </td>
                                        <td className='py-4 px-6'>
                                            {event.image ? (
                                                <img
                                                    src={`${SERVER_URL}/uploads/events/${event.image}`}
                                                    alt={event.event_title}
                                                    className='w-35 h-20 object-cover rounded-md'
                                                />
                                            ) : (
                                                <div className='w-24 h-14 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400'>
                                                    No image
                                                </div>
                                            )}
                                        </td>
                                        <td className='py-4 px-6 text-[#031F40] font-medium'>
                                            {event.event_title}
                                        </td>
                                        <td className='py-4 px-6 text-[#031F40]'>
                                            {getOrganizerName(event) || '-'}
                                        </td>
                                        <td className='py-4 px-6 text-[#031F40]'>
                                            {formatDate(event.event_date)}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Events;