'use client'
import Adminmenu from '@/components/molecules/adminmenu';
import React, { useState } from 'react';
import Searchbar from '@/components/atoms/searchbar';
import Filter from '@/components/atoms/filter';
import Button from '@/components/atoms/button';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('eo')
    return (
        <div>
            <Adminmenu />
            <div className='grid grid-cols-1 p-4 md:p-8'>
                <div className='flex flex-row gap-2 mb-2 md:gap-4 md:mb-4'>
                    <div className='flex-1'>
                        <Searchbar />
                    </div>
                    <div className='shrink-0 md:w-32'>
                        <Filter />
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-2 md:gap-4'>
                    <Button text='Organizer Report' className={`${activeTab === 'eo' ? 'bg-[#031F40] shadow-xl' : 'bg-[#fafafa] hover:bg-slate-100 text-[#031F40] shadow-xl'}`} onClick={() => setActiveTab('eo')}/>
                    <Button text='User Report' className={`${activeTab === 'user' ? 'bg-[#031F40] shadow-xl' : 'bg-[#fafafa] hover:bg-slate-100 text-[#031F40] shadow-xl'}`} onClick={() => setActiveTab('user')}/>
                </div>
            </div>
        </div>
    );
}

export default Reports;
