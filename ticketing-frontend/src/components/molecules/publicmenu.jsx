'use client';

import React, { useState } from 'react';
import Logo from '../atoms/logo';
import Button from '../atoms/button';
import Formjoinpartner from './formjoinpartner';
import { useRouter } from 'next/navigation';

const Publicmenu = () => {
    const [isFormOpen, setFormOpen] = useState(false);
    const router = useRouter();

    const handleLogin = () => {
        router.push('/login');
    };

    const handleCloseForm = () => {
        setFormOpen(false);
    };

    return (
        <>
            <div className='grid grid-cols-2 px-8 py-8 md:px-10 md:py-10 bg-[#031F40] items-center'>
                <div className='flex items-center gap-25'>
                    <Logo />
                    <div className='hidden md:flex md:items-center md:gap-4'>
                        <a href='' className='text-lg hover:underline'>Home</a>
                        <a href='' className='text-lg hover:underline'>About</a>
                    </div>                    
                </div>

                <div className='hidden md:flex justify-end gap-4'>
                    <Button text='Join Partner' className='bg-[#F5C345] hover:cursor-pointer' onClick={() => setFormOpen(true)}/>
                    <Button text='Login' className='bg-[#FAFAFA] text-[#031F40] pl-10 pr-10 hover:cursor-pointer' onClick={handleLogin}/>
                </div>
            </div>

            <Formjoinpartner
                isOpen={isFormOpen}
                onClose={handleCloseForm}
            />
        </>
    );
};

export default Publicmenu;