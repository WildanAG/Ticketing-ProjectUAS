'use client'
import Adminmenu from '@/components/molecules/adminmenu';
import React from 'react';
import Button from '@/components/atoms/button';
import { useState } from 'react';
import Searchbar from '@/components/atoms/searchbar';
import Filter from '@/components/atoms/filter';
import Listorganizer from '@/components/molecules/listorganizer';
import Listpending from '@/components/molecules/listpending';

const Organizers = () => {
    const [activeTab, setActiveTab] = useState('list');    
    const [search, setSearch] = useState("");

    return (
        <div>
            <Adminmenu />
            
            <div className='p-4 md:p-8'>
                <div className='flex flex-col md:flex-row md:items-center gap-4 w-full'>                    
                    <div className='grid grid-cols-2 gap-4'>
                        <Button text='Organizer List' className={`${activeTab === 'list' ? 'bg-[#031F40] shadow-xl' : 'bg-[#fafafa] hover:bg-slate-100 text-[#031F40] shadow-xl'}`} onClick={() => setActiveTab('list')}/>
                        <Button text='Pending Approval' className={`${activeTab === 'pending' ? 'bg-[#031F40] shadow-xl' : 'bg-[#fafafa] hover:bg-slate-100 text-[#031F40] shadow-xl'}`} onClick={() => setActiveTab('pending')}/>
                    </div>

                    <div className='flex flex-1 items-center gap-2 md:gap-4 w-full'>
                        <div className='flex-1'>
                            <Searchbar
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className='shrink-0 md:w-32'>
                            <Filter />
                        </div>
                    </div>                                      
                </div>

                <div className='w-full mt-4'>
                    {activeTab === 'list' ? (
                        <Listorganizer /> 
                    ) : (
                        <Listpending /> 
                    )}
                </div>  
            </div>
        </div>
    );
}

export default Organizers;
