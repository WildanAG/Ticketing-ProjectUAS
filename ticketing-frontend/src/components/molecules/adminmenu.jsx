'use client'
import React from 'react';
import Logo from '../atoms/logo';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoClose, IoMenu, IoLogOutOutline } from "react-icons/io5";


const Adminmenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        // Sesuaikan dengan mekanisme auth Anda, contoh:
        localStorage.removeItem('token');
        // atau: document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        router.push('/');
    };

    return (
        <div className='justify-center items-center sticky top-0 z-10'>  
           <div className='flex flex-row bg-[#031F40] p-5 items-center justify-between'>
                <div className='flex items-center pl-1 md:pl-5'>
                    <Logo />                   
                </div>
                
                <div className='flex gap-5 justify-center items-center'>
                    <div className='hidden md:flex justify-end gap-4 select-none'>
                        <h2 className='bg-[#F5C345] rounded-xl font-semibold text-shadow-lg px-4 md:px-16 py-2'>Admin</h2>
                    </div>

                    <button onClick={() => setIsOpen(!isOpen)} className='p-2 md:hidden text-white focus:outline-none text-2xl'>
                        {isOpen ? <IoClose /> : <IoMenu />}
                    </button>
                </div>
                      
           </div>

           <div className={`${isOpen ? 'block' : 'hidden'} md:block bg-[#031F40] px-8 pb-5 md:py-2`}>
                <hr className='h-px bg-slate-600 border-0 -mx-8 mb-4 md:hidden'/>
                <div className='flex justify-start select-none mb-4 md:hidden'>
                    <h2 className='bg-[#F5C345] text-sm rounded-sm font-semibold text-shadow-lg w-full text-center'>Admin</h2>
                </div>
                <div className='md:px-2'>
                    <ul className='flex flex-col text-sm md:text-lg md:flex-row gap-4 md:gap-24 md:items-center'>
                        <li><Link href="/admin_page/a_dashboard" className='hover:underline'>Dashboard</Link></li>
                        <li><Link href="/admin_page/a_organizers" className='hover:underline'>Organizers</Link></li>
                        <li><Link href="/admin_page/a_events" className='hover:underline'>Events</Link></li>
                        <li><Link href="/admin_page/a_orders" className='hover:underline'>Orders</Link></li>
                        <li><Link href="/admin_page/a_customers" className='hover:underline'>Customers</Link></li>
                        <li><Link href="/admin_page/a_reports" className='hover:underline'>Reports</Link></li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className='flex items-center gap-1 hover:underline text-red-400 hover:text-red-300'
                            >
                                <IoLogOutOutline className='text-lg' />
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
           </div>

            
        </div>
    );
}

export default Adminmenu;