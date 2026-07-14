import React from 'react';

const Logo = ({className=''}) => {
    return (
        <div className='md:block'>            
            <h1 className={`text-white text-[20px] md:text-[32px] font-extrabold font-poppins tracking-wide ${className}`}>
                Ticke<span className='text-[#F5C345]'>Ting</span>
            </h1>
        </div>
    );
}

export default Logo;