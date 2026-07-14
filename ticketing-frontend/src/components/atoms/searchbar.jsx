import React from 'react';

const Searchbar = ({ value, onChange }) => {
    return (
        <div>            
            <input 
                type="text" 
                value={value} 
                onChange={onChange} 
                placeholder='Search....' 
                className='bg-[#fafafa] w-full p-4 rounded-lg shadow-xl transition-colors focus:border-[#031F40] text-[#031f40]'
            />            
        </div>
    );
}

export default Searchbar;