'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Organizermenu from '@/components/molecules/organizermenu';

const Dashboard = () => {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    

    const [dashboard, setDashboard] = useState({
        totalRevenue: 0,
        ticketSold: 0,
        totalAttendees: 0,
        totalEvents: 0
    });

    useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                "http://localhost:3001/api/dashboard/eo",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                setDashboard(res.data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil dashboard:", err);
        }
        };

        fetchDashboard();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/events/my', {
                    withCredentials: true
                });
                setEvents(res.data.data || []);
            } catch (err) {
                console.error('Gagal memuat events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const upcomingEvents = events.filter((e) => e.event_status === 'upcoming');

    return (
        <div>
            <Organizermenu />

            <div className='p-4 md:p-8'>
                <div className='grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-3'>
                    <div className='bg-[#031F40] rounded-lg p-4 md:p-12'>
                        <h2 className='text-white font-semibold md:text-2xl mb-2'>Total Revenue:</h2>
                        <p className='text-white md:text-2xl'>Rp {dashboard.totalRevenue.toLocaleString("id-ID")}</p>
                    </div>
                    <div className='bg-[#031F40] rounded-lg p-4 md:p-12'>
                        <h2 className='text-white font-semibold md:text-2xl mb-2'>Ticket Solds:</h2>
                        <p className='text-white md:text-2xl'>{dashboard.ticketSold}</p>
                    </div>                    
                    <div className='bg-[#031F40] rounded-lg p-4 md:p-12'>
                        <h2 className='text-white font-semibold md:text-2xl mb-2'>All Events:</h2>
                        <p className='text-white md:text-2xl'>{loading ? '...' : events.length}</p>
                    </div>
                </div>

                <div className='pt-4'>
                    <h2 className='text-[#031F40] text-lg font-bold md:text-2xl'>Upcoming Events</h2>

                    <div className='mt-4'>
                        {loading ? (
                            <p className='text-slate-500 text-sm'>Memuat event...</p>
                        ) : upcomingEvents.length === 0 ? (
                            <div className='bg-[#fafafa] rounded-xl border-2 border-dashed border-slate-300 p-8 text-center'>
                                <p className='text-slate-500 text-sm'>Belum ada event upcoming.</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.event_id}
                                        onClick={() => router.push(`/eventOrganizer_page/eo_events/${event.event_id}`)}
                                        className='cursor-pointer bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition'
                                    >
                                        <div className='h-32 bg-gray-100'>
                                            {event.image ? (
                                                <img
                                                    src={`http://localhost:3001/uploads/events/${event.image}`}
                                                    alt={event.event_title}
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className='flex h-full items-center justify-center text-gray-400 text-xs'>Tidak ada gambar</div>
                                            )}
                                        </div>
                                        <div className='p-3'>
                                            <h3 className='font-semibold text-[#031F40] text-sm truncate'>{event.event_title}</h3>
                                            <p className='text-xs text-slate-500 mt-1'>📍 {event.event_location}</p>
                                            <p className='text-xs text-slate-500'>
                                                📅 {new Date(event.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;