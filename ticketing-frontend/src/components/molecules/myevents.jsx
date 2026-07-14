'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const statusStyle = {
    private:  'bg-gray-500',
    upcoming: 'bg-blue-500',
    ongoing:  'bg-green-500',
    done:     'bg-red-500',
};

const MyEvents = () => {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/events/my', {
                    withCredentials: true
                });
                setEvents(res.data.data || res.data);
            } catch (err) {
                console.error('Gagal memuat events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <p className='text-center py-10 text-[#031F40]'>Memuat event...</p>;

    if (events.length === 0) return (
        <div className='rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center'>
            <p className='text-lg font-semibold text-slate-700 mb-1'>Belum ada event</p>
            <p className='text-sm text-slate-500'>Klik tombol Create Event untuk mulai membuat event baru.</p>
        </div>
    );

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events.map((event) => (
                <div
                    key={event.event_id}
                    onClick={() => router.push(`/eventOrganizer_page/eo_events/${event.event_id}`)}
                    className='group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all'
                >
                    <div className='relative h-52 bg-gray-100'>
                        {event.image ? (
                            <img
                                src={`http://localhost:3001/uploads/events/${event.image}`}
                                alt={event.event_title}
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <div className='flex h-full items-center justify-center text-gray-400 text-sm'>Tidak ada gambar</div>
                        )}
                        <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white capitalize ${statusStyle[event.event_status] || 'bg-gray-400'}`}>
                            {event.event_status}
                        </span>
                    </div>
                    <div className='p-4'>
                        <h4 className='text-base font-bold text-[#031F40] mb-1 truncate'>{event.event_title}</h4>
                        <p className='text-xs text-slate-500 mb-1'>📍 {event.event_location}</p>
                        <p className='text-xs text-slate-500'>📅 {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className='border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-[#031F40] group-hover:text-[#F5C345] transition'>
                        Kelola Event →
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyEvents;