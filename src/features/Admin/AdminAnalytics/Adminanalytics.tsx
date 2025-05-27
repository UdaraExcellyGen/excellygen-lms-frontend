import React from 'react';
import Header from './Components/Header';
import Enrollment from './Components/Enrolmentchart';
import Userdistribution from './Components/Userdistribution';

import Courseavailability from './Components/Courseavailability';

const AdminAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      <Header />
      
      <div className="grid grid-cols-1 gap-4">
        <Enrollment />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Courseavailability />
          <Userdistribution />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;