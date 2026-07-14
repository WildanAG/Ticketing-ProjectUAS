import React from 'react';
import { IoFilter } from "react-icons/io5";

const Filter = () => {
    return (
        <div className='bg-[#fafafa] w-full p-4 rounded-lg shadow-xl text-[#031F40] font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors'>
            <div className='flex items-center justify-center'>
                <IoFilter className='text-2xl'/>                
            </div>            
        </div>
    );
}

export default Filter;