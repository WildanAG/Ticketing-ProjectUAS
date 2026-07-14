import React from 'react';
import Publicmenu from '../molecules/publicmenu';

const Homepage = () => {    
    return (        
        <div>
            <Publicmenu />
            <div className='w-full overflow-hidden'>
                <img src="/images/homepageIMG.png" alt="" className='w-full h-auto max-h-200 object-cover'/>
            </div>            
        </div>
    );
}

export default Homepage;
