'use client'
import React from 'react';
import Adminmenu from '@/components/molecules/adminmenu';
import Searchbar from '@/components/atoms/searchbar';
import Filter from '@/components/atoms/filter';
import Button from '@/components/atoms/button';
import ListUser from '@/components/molecules/listuser';
import {useState, useEffect} from 'react';

const Customers = () => {
    const [search, setSearch] = useState('');
    return (
        <div>
            <Adminmenu />
            <div className='p-4 md:p-8'>
                <div className='flex flex-col gap-2 md:flex-row md:gap-4'>                    
                    <div className='flex flex-row gap-2 md:gap-4 flex-1'>                        
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
                <div className='mt-2 md:mt-4'>
                    <ListUser search={search} />
                </div>

            </div>
        </div>
    );
}

export default Customers;
