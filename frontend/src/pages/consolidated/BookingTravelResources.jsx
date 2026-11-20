import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, CalendarCheck, Handshake, ShieldAlert } from 'lucide-react';
import { TourPackages } from '../packages/TourPackages';
import { BookingsManagement } from '../bookings/BookingsManagement';
import { TravelPartners } from '../partners/TravelPartners';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';

export const BookingTravelResources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const currentTab = searchParams.get('tab') || 'packages';

  const [activeTab, setActiveTab] = useState(
    currentTab === 'bookings' ? 'bookings' : currentTab === 'partners' ? 'partners' : 'packages'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const isStaff = role === ROLES.STAFF;

  return (
    <div className="space-y-6">
      {/* Staff View Notice */}
      {isStaff && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Staff Operational Access:</strong> You are viewing branch travel resources in operational mode. Package editing and partner agreement contracts are managed by Branch Managers and Franchise Owners.
            </span>
          </div>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
            Role: Staff
          </span>
        </div>
      )}

      {/* Internal Navigation Header */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('packages')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'packages'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tour Packages</span>
        </button>

        <button
          onClick={() => handleTabChange('bookings')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'bookings'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Bookings Management</span>
        </button>

        <button
          onClick={() => handleTabChange('partners')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'partners'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Travel Partners</span>
        </button>
      </div>

      {/* Render Consolidated View */}
      {activeTab === 'packages' && <TourPackages />}
      {activeTab === 'bookings' && <BookingsManagement />}
      {activeTab === 'partners' && <TravelPartners />}
    </div>
  );
};
