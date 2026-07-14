'use client'
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Organizermenu from '@/components/molecules/organizermenu';
import { IoArrowBack, IoClose, IoAdd, IoTrash } from 'react-icons/io5';

const statusStyle = {
    private:  'bg-gray-500',
    upcoming: 'bg-blue-500',
    ongoing:  'bg-green-500',
    done:     'bg-red-500',
};

const crowdStyle = {
    Ramai:  'bg-red-500',
    Sedang: 'bg-yellow-500',
    Sepi:   'bg-green-500',
};

const EventDetail = ({ params }) => {
    const router = useRouter();
    const { id } = use(params);

    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [crowd, setCrowd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [ticketForm, setTicketForm] = useState({
        ticket_category: '',
        ticket_quota: '',
        current_price: '',
        base_price: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventRes, ticketsRes, crowdRes] = await Promise.all([
                axios.get(`http://localhost:3001/api/events/${id}`),
                axios.get(`http://localhost:3001/api/tickets/event/${id}`),
                axios.get(`http://localhost:3001/api/events/${id}/crowd-estimation`)
            ]);
            setEvent(eventRes.data.data);
            setTickets(ticketsRes.data.data || []);
            setCrowd(crowdRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat data event.');
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleTicketInputChange = (e) => {
        const { name, value } = e.target;
        setTicketForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTicket = async (e) => {
        e.preventDefault();

        if (!ticketForm.ticket_category.trim())
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Kategori tiket wajib diisi.', confirmButtonColor: '#031F40' });
        if (!ticketForm.ticket_quota || ticketForm.ticket_quota <= 0)
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Kuota harus lebih dari 0.', confirmButtonColor: '#031F40' });
        if (!ticketForm.current_price || ticketForm.current_price <= 0)
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Harga tiket harus lebih dari 0.', confirmButtonColor: '#031F40' });
        if (!ticketForm.base_price || ticketForm.base_price <= 0)
            return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Harga dasar harus lebih dari 0.', confirmButtonColor: '#031F40' });

        try {
            setFormLoading(true);
            const response = await axios.post('http://localhost:3001/api/tickets', {
                event_id: parseInt(id),
                ticket_category: ticketForm.ticket_category,
                ticket_quota: parseInt(ticketForm.ticket_quota),
                current_price: parseInt(ticketForm.current_price),
                base_price: parseInt(ticketForm.base_price),
                ticket_sold: 0
            }, { withCredentials: true });

            setTickets((prev) => [...prev, response.data.data]);
            setTicketForm({ ticket_category: '', ticket_quota: '', current_price: '', base_price: '' });
            setIsFormOpen(false);

            Swal.fire({
                icon: 'success',
                title: 'Tiket Ditambahkan!',
                text: 'Kategori tiket baru berhasil dibuat.',
                confirmButtonColor: '#031F40',
                timer: 1600,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menambahkan Tiket',
                text: err.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.',
                confirmButtonColor: '#031F40'
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        const confirmResult = await Swal.fire({
            icon: 'warning',
            title: 'Yakin hapus tiket ini?',
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#031F40'
        });
        if (!confirmResult.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:3001/api/tickets/${ticketId}`, { withCredentials: true });
            setTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
            Swal.fire({
                icon: 'success',
                title: 'Tiket Dihapus',
                confirmButtonColor: '#031F40',
                timer: 1400,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menghapus Tiket',
                text: err.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.',
                confirmButtonColor: '#031F40'
            });
        }
    };

    const handleDeleteEvent = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Hapus Event?",
            text: "Semua tiket yang berkaitan dengan event ini juga akan hilang.",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#031F40"
        });

        if (!result.isConfirmed) return;

        try {

            await axios.delete(
                `http://localhost:3001/api/events/${id}`,
                {
                    withCredentials: true
                }
            );

            await Swal.fire({
                icon: "success",
                title: "Event berhasil dihapus",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/organizer/event");

        } catch (err) {

            Swal.fire({
                icon: "error",
                title: "Gagal menghapus event",
                text: err.response?.data?.message || "Terjadi kesalahan."
            });

        }
    };

    if (loading) return (
        <div><Organizermenu />
            <div className='flex items-center justify-center h-64'>
                <p className='text-gray-500'>Memuat event...</p>
            </div>
        </div>
    );

    if (error || !event) return (
        <div><Organizermenu />
            <div className='flex items-center justify-center h-64'>
                <p className='text-red-500'>{error || 'Event tidak ditemukan.'}</p>
            </div>
        </div>
    );

    return (
        <div>
            <Organizermenu />
            <div className='p-4 md:p-8'>

                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#031F40] hover:underline font-semibold"
                    >
                        <IoArrowBack size={20}/>
                        Back
                    </button>

                    <button
                        onClick={handleDeleteEvent}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
                    >
                        <IoTrash size={18}/>
                        Delete Event
                    </button>
                </div>

                <div className='bg-white rounded-2xl shadow-lg overflow-hidden mb-8'>
                    <div className='grid grid-cols-1 md:grid-cols-3'>
                        <div className='md:col-span-1 h-64 md:h-auto bg-gray-200'>
                            {event.image ? (
                                <img src={`http://localhost:3001/uploads/events/${event.image}`} alt={event.event_title} className='w-full h-full object-cover'/>
                            ) : (
                                <div className='w-full h-full flex items-center justify-center text-gray-400'>No Image</div>
                            )}
                        </div>

                        <div className='md:col-span-2 p-6 space-y-3'>
                            <div className='flex items-start justify-between gap-4'>
                                <h1 className='text-2xl font-bold text-[#031F40]'>{event.event_title}</h1>
                                <div className='flex gap-2'>
                                    <span className={`shrink-0 px-3 py-1 rounded-full text-white text-xs font-semibold capitalize ${statusStyle[event.event_status] || 'bg-gray-400'}`}>
                                        {event.event_status}
                                    </span>
                                    {crowd && (
                                        <span className={`shrink-0 px-3 py-1 rounded-full text-white text-xs font-semibold ${crowdStyle[crowd.crowd_label] || 'bg-gray-400'}`}>
                                            {crowd.crowd_label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className='text-gray-700'>📍 {event.event_location}</p>
                            <p className='text-gray-700'>📅 {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p className='text-gray-700'>👥 Capacity: {event.max_capacity} orang</p>

                            {crowd && (
                                <p className='text-gray-700'>
                                    📊 Estimated Attendance: <span className='font-semibold'>{crowd.estimated_attendance}%</span> ({crowd.crowd_label})
                                </p>
                            )}

                            {event.ticket_start && event.ticket_ends && (
                                <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-gray-700'>
                                    🎟️ Ticket Sales: {new Date(event.ticket_start).toLocaleDateString('id-ID')} — {new Date(event.ticket_ends).toLocaleDateString('id-ID')}
                                </div>
                            )}

                            {event.description && (
                                <p className='text-gray-600 leading-relaxed text-sm'>{event.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xl font-bold text-[#031F40]'>Event Tickets</h2>
                    <button onClick={() => setIsFormOpen(true)} className='flex items-center gap-2 bg-[#F5C345] text-[#031F40] px-4 py-2 rounded-xl hover:bg-yellow-400 transition font-semibold text-sm'>
                        <IoAdd size={18}/> Add Ticket
                    </button>
                </div>

                {tickets.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {tickets.map((ticket) => (
                            <div key={ticket.ticket_id} className='bg-white rounded-xl shadow p-5 border-l-4 border-[#F5C345]'>
                                <div className='flex items-start justify-between mb-3'>
                                    <h3 className='font-bold text-[#031F40]'>{ticket.ticket_category}</h3>
                                    <button onClick={() => handleDeleteTicket(ticket.ticket_id)} className='text-red-400 hover:text-red-600 transition'>
                                        <IoTrash size={16}/>
                                    </button>
                                </div>
                                <div className='space-y-1 text-sm text-gray-600'>
                                    <p>Quota: <span className='font-semibold text-[#031F40]'>{ticket.ticket_quota}</span></p>
                                    <p>Sold: <span className='font-semibold text-[#031F40]'>{ticket.ticket_sold || 0}</span></p>
                                    <p>Remaining: <span className='font-semibold text-[#031F40]'>{ticket.ticket_quota - (ticket.ticket_sold || 0)}</span></p>
                                    <div className='border-t pt-2 mt-2'>
                                        <p>Base Price: <span className='font-semibold'>Rp {parseInt(ticket.base_price).toLocaleString('id-ID')}</span></p>
                                        <p>Current Price: <span className='font-semibold'>Rp {parseInt(ticket.current_price).toLocaleString('id-ID')}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200'>
                        <p className='text-gray-500 font-medium mb-1'>No tickets available</p>
                        <p className='text-sm text-gray-400'>Add tickets to start accepting purchases.</p>
                    </div>
                )}

                {isFormOpen && (
                    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
                        <div className='bg-white rounded-2xl shadow-xl w-full max-w-md'>
                            <div className='flex items-center justify-between p-5 border-b'>
                                <h2 className='text-lg font-bold text-[#031F40]'>Add Ticket</h2>
                                <button onClick={() => setIsFormOpen(false)} className='text-gray-400 hover:text-gray-600'>
                                    <IoClose size={22}/>
                                </button>
                            </div>

                            <div className='p-5 space-y-4'>
                                <form onSubmit={handleAddTicket} className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-1'>Ticket Category <span className='text-red-500'>*</span></label>
                                        <input type='text' name='ticket_category' value={ticketForm.ticket_category} onChange={handleTicketInputChange} placeholder='VIP, Regular, Economy...' className='w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C345] text-[#031f40]'/>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-1'>Quota <span className='text-red-500'>*</span></label>
                                        <input type='number' name='ticket_quota' value={ticketForm.ticket_quota} onChange={handleTicketInputChange} placeholder='100' min='1' className='w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C345] text-[#031f40]'/>
                                    </div>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div>
                                            <label className='block text-sm font-semibold text-gray-700 mb-1'>Base Price (Rp) <span className='text-red-500'>*</span></label>
                                            <input type='number' name='base_price' value={ticketForm.base_price} onChange={handleTicketInputChange} placeholder='150000' min='0' className='w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C345] text-[#031f40]'/>
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-gray-700 mb-1'>Current Price (Rp) <span className='text-red-500'>*</span></label>
                                            <input type='number' name='current_price' value={ticketForm.current_price} onChange={handleTicketInputChange} placeholder='200000' min='0' className='w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C345] text-[#031f40]'/>
                                        </div>
                                    </div>
                                    <div className='flex gap-3 pt-2'>
                                        <button type='button' onClick={() => setIsFormOpen(false)} className='flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition'>Batal</button>
                                        <button type='submit' disabled={formLoading} className='flex-1 py-2.5 bg-[#F5C345] rounded-xl text-sm font-semibold text-[#031F40] hover:bg-yellow-400 transition disabled:opacity-60'>
                                            {formLoading ? 'Memproses...' : 'Tambah Tiket'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetail;