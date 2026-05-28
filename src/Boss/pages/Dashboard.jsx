import React from 'react';
import PageMeta from '../../PageMeta';

const Dashboard = () => {
  return (
    <div>
      <PageMeta title="Dashboard | NeoPos" description="Əsas göstəricilər" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Xoş gəldiniz 👋</h1>
        <p className="text-gray-500 mt-1">Statistikalar və əsas göstəricilər</p>
      </div>

      {/* Kartlar bura gələcək */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Açıq çeklər" value="164 ₼" />
        <StatCard title="Qapalı çeklər" value="284 ₼" />
        {/* ... digər kartlar */}
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <p className="text-sm text-gray-500 mb-2">{title}</p>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

export default Dashboard;