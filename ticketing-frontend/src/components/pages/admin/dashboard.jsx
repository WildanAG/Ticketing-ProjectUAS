'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Adminmenu from '@/components/molecules/adminmenu';
import axios from "axios";

const Dashboard = () => {
    const [dashboard, setDashboard] = useState({
        revenue: 0,
        ticketSold: 0,
        eoCount: 0,
        userCount: 0,
        pendingCount: 0,
        eventCount: 0
    });

    useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");

            const { data } = await axios.get("/api/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                setDashboard(data.data);
            }

        } catch (err) {
            console.error("Gagal mengambil dashboard:", err);
        }
    };

    fetchDashboard();
}, []);

    return (
        <div>
            <Adminmenu />
            <div className='p-4 md:p-8'>
                <div className='grid grid-cols-1 items-center justify-center gap-4 md:grid-cols-2'>
                    <div className='bg-[#031F40] rounded-lg p-4 md:p-12'>
                        <h2 className='text-white font-semibold md:text-2xl mb-2'>Total Revenue:</h2>
                        <p className='text-white md:text-2xl'>Rp 12.000.000</p>
                    </div>
                    <div className='bg-[#031F40] rounded-lg p-4 md:p-12'>
                        <h2 className='text-white font-semibold md:text-2xl mb-2'>Ticket Solds:</h2>
                        <p className='text-white md:text-2xl'>{dashboard.ticketSold}</p>
                    </div>
                </div>

                <div className='grid grid-cols-2 items-center justify-center gap-4 mt-4 md:mt-8 md:grid-cols-4'>
                    <div className='bg-[#fafafa] rounded-lg p-5 flex flex-col justify-between min-h-27.5 shadow-sm'>
                        <h2 className='text-[#031f40] font-bold text-sm mb-2 md:text-lg'>Event Organizer Account</h2>
                        <p className='text-[#031f40] md:text-xl'>{dashboard.eoCount}</p>
                    </div>
                    <div className='bg-[#fafafa] rounded-lg p-5 flex flex-col justify-between min-h-27.5 shadow-sm'>
                        <h2 className='text-[#031f40] font-bold text-sm mb-2 md:text-lg'>User Account</h2>
                        <p className='text-[#031f40] md:text-xl'>{dashboard.userCount}</p>
                    </div>
                    <div className='bg-[#fafafa] rounded-lg p-5 flex flex-col justify-between min-h-27.5 shadow-sm'>
                        <h2 className='text-[#031f40] font-bold text-sm mb-2 md:text-lg'>Pending Approval</h2>
                        <p className='text-[#031f40] md:text-xl'>{dashboard.pendingCount}</p>
                    </div>
                    <div className='bg-[#fafafa] rounded-lg p-5 flex flex-col justify-between min-h-27.5 shadow-sm'>
                        <h2 className='text-[#031f40] font-bold text-sm mb-2 md:text-lg'>Events</h2>
                        <p className='text-[#031f40] md:text-xl'>{dashboard.eventCount}</p>
                    </div>
                </div>            
            </div>
            
        </div>
    );
}

export default Dashboard;
