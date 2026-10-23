import React, { useState, useMemo } from 'react';
import { Video, Plus, CheckCircle2, Clock, Calendar, AlertCircle, Eye, EyeOff, Edit3, Trash2, ArrowRight, ShieldCheck, DollarSign, MapPin, Truck, RefreshCw } from 'lucide-react';
import type { EquipmentItem } from './RentGearModal';
import type { UserProfileData } from './ClientProfileSection';
import { type Language, t, getEquipmentCategoryLabel, getBookingStatusLabel } from '../i18n/translations';

interface EquipmentOwnerDashboardProps {
  currentUser: UserProfileData;
  equipmentList: EquipmentItem[];
  bookings: any[];
  onOpenAddGearModal: () => void;
  onEquipmentUpdated: (updatedList: EquipmentItem[]) => void;
  onBookingStatusChanged: (bookingId: string, newStatus: string, note: string) => void;
  lang?: Language;
}

export const EquipmentOwnerDashboard: React.FC<EquipmentOwnerDashboardProps> = ({
  currentUser,
  equipmentList,
  bookings,
  onOpenAddGearModal,
  onEquipmentUpdated,
  onBookingStatusChanged,
  lang = 'EN'
}) => {
  const [activeTab, setActiveTab] = useState<'MY_LISTINGS' | 'RENTALS' | 'CALENDAR' | 'SETTINGS'>('MY_LISTINGS');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit Listing state
  const [editingGear, setEditingGear] = useState<EquipmentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editDeposit, setEditDeposit] = useState('');
  const [editSpecs, setEditSpecs] = useState('');
  const [editTerms, setEditTerms] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Owner's gear listings
  const myListings = useMemo(() => {
    return equipmentList.filter(
      item => item.ownerId === currentUser.id || item.ownerName?.toLowerCase() === currentUser.name?.toLowerCase()
    );
  }, [equipmentList, currentUser]);

  // Owner's rental requests
  const myRentals = useMemo(() => {
    return bookings.filter(b => 
      b.type === 'EQUIPMENT_RENTAL' && 
      (b.providerId === currentUser.id || b.providerName?.toLowerCase() === currentUser.name?.toLowerCase())
    );
  }, [bookings, currentUser]);

  const confirmedRentals = useMemo(() => {
    return myRentals.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));
  }, [myRentals]);

  // Toggle publish / unpublish
  const handleTogglePublish = async (item: EquipmentItem) => {
    setIsUpdating(item.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/equipment/${item.id}/toggle-publish`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || (lang === 'SW' ? 'Imeshindwa kusasisha hali ya uchapishaji' : 'Failed to update publication status'));
      }

      const updated = equipmentList.map(i => (i.id === item.id ? data.equipment : i));
      onEquipmentUpdated(updated);
      setActionSuccess(
        lang === 'SW'
          ? `Kifaa "${item.title}" sasa ${data.equipment.isPublished ? 'KIMEWEKWA SOKONI' : 'KIMETOLEWA SOKONI'}`
          : `Listing "${item.title}" is now ${data.equipment.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}`
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Error updating status');
    } finally {
      setIsUpdating(null);
    }
  };

  // Delete listing
  const handleDeleteGear = async (item: EquipmentItem) => {
    const confirmPrompt = lang === 'SW'
      ? `Je, una uhakika unataka kuondoa "${item.title}" kwenye orodha yako ya vifaa?`
      : `Are you sure you want to remove "${item.title}" from your gear listings?`;
    if (!window.confirm(confirmPrompt)) {
      return;
    }

    setIsUpdating(item.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/equipment/${item.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete listing');
      }

      const updated = equipmentList.filter(i => i.id !== item.id);
      onEquipmentUpdated(updated);
      setActionSuccess(
        lang === 'SW' ? `Kifaa "${item.title}" kimeondolewa kikamilifu.` : `Listing "${item.title}" removed.`
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Error deleting listing');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenEdit = (item: EquipmentItem) => {
    setEditingGear(item);
    setEditTitle(item.title);
    setEditRate(String(item.dailyRate));
    setEditDeposit(String(item.depositAmount || '0'));
    setEditSpecs(item.modelSpecs || '');
    setEditTerms(item.pickupDeliveryTerms || '');
    setEditLocation(item.location);
  };

  // Save edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGear) return;

    setIsUpdating(editingGear.id);
    try {
      const response = await fetch(`/api/equipment/${editingGear.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          dailyRate: Number(editRate),
          depositAmount: Number(editDeposit),
          modelSpecs: editSpecs.trim(),
          pickupDeliveryTerms: editTerms.trim(),
          location: editLocation.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update equipment');
      }

      const updated = equipmentList.map(i => (i.id === editingGear.id ? data.equipment : i));
      onEquipmentUpdated(updated);
      setEditingGear(null);
      setActionSuccess(lang === 'SW' ? 'Kifaa kimesasishwa kikamilifu!' : 'Equipment listing updated successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Error saving changes');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-4 py-1 text-xs">
      {/* HEADER & METRICS */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#F5F3EE]">
            {lang === 'SW' ? 'Dashibodi ya Mmiliki wa Vifaa' : 'Equipment Owner Dashboard'}
          </h2>
          <p className="text-[11px] text-[#A6ADBB]">
            {lang === 'SW'
              ? 'Simamia vifaa vyako, mikataba ya kukodisha, malipo ya escrow na upatikanaji'
              : 'Manage gear packages, rental dispatch, escrow releases & availability'}
          </p>
        </div>
        <button
          onClick={onOpenAddGearModal}
          className="bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
        >
          <Plus size={14} />
          <span>{lang === 'SW' ? '+ Ongeza Kifaa Kipya' : 'Add New Equipment'}</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3">
          <span className="text-[#A6ADBB] text-[10px] block">
            {lang === 'SW' ? 'Vifaa Vyangu' : 'My Gear Inventory'}
          </span>
          <span className="font-bold text-[#F5F3EE] text-sm mt-0.5 block">
            {myListings.length} {lang === 'SW' ? 'Vifaa' : 'Packages'}
          </span>
          <span className="text-[9px] text-[#D6AD62]">
            {myListings.filter(i => i.isPublished).length} {lang === 'SW' ? 'Vilivyopo Sokoni' : 'Active Online'}
          </span>
        </div>
        <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3">
          <span className="text-[#A6ADBB] text-[10px] block">
            {lang === 'SW' ? 'Ukodishaji Unaofanyika' : 'Active Rentals'}
          </span>
          <span className="font-bold text-[#D6AD62] text-sm mt-0.5 block">
            {confirmedRentals.length} {lang === 'SW' ? 'Zinazoendelea' : 'Dispatched'}
          </span>
          <span className="text-[9px] text-emerald-400">
            {lang === 'SW' ? 'Ulinzi wa Escrow' : 'Escrow Protected'}
          </span>
        </div>
        <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3">
          <span className="text-[#A6ADBB] text-[10px] block">
            {lang === 'SW' ? 'Maombi ya Kukodisha' : 'Rental Inquiries'}
          </span>
          <span className="font-bold text-[#F5F3EE] text-sm mt-0.5 block">
            {myRentals.length} {lang === 'SW' ? 'Jumla' : 'Total'}
          </span>
          <span className="text-[9px] text-[#A6ADBB]">
            {lang === 'SW' ? 'Maombi yaliyopokelewa' : 'Requests received'}
          </span>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* OWNER TABS */}
      <div className="flex gap-1.5 border-b border-[#262C3D] pb-2 text-[11px] overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('MY_LISTINGS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'MY_LISTINGS' ? 'bg-[#D6AD62] text-[#080B14]' : 'bg-[#171A24] text-[#A6ADBB]'
          }`}
        >
          {lang === 'SW' ? 'Vifaa Vyangu' : 'My Listings'} ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('RENTALS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'RENTALS' ? 'bg-[#D6AD62] text-[#080B14]' : 'bg-[#171A24] text-[#A6ADBB]'
          }`}
        >
          {lang === 'SW' ? 'Maombi ya Kukodisha' : 'Rental Requests'} ({myRentals.length})
        </button>
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'CALENDAR' ? 'bg-[#D6AD62] text-[#080B14]' : 'bg-[#171A24] text-[#A6ADBB]'
          }`}
        >
          {lang === 'SW' ? 'Kalenda ya Upatikanaji' : 'Availability Calendar'}
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTINGS' ? 'bg-[#D6AD62] text-[#080B14]' : 'bg-[#171A24] text-[#A6ADBB]'
          }`}
        >
          {lang === 'SW' ? 'Dhamana & Masharti' : 'Deposit & Terms'}
        </button>
      </div>

      {/* TAB 1: MY LISTINGS */}
      {activeTab === 'MY_LISTINGS' && (
        <div className="space-y-3">
          {myListings.length === 0 ? (
            <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-3">
              <Video size={36} className="mx-auto text-[#A6ADBB]" />
              <h4 className="text-sm font-bold text-[#F5F3EE]">
                {lang === 'SW' ? 'Hujaweka Kifaa Chochote Sokoni Bado' : 'No Gear Listed Yet'}
              </h4>
              <p className="text-xs text-[#A6ADBB] max-w-xs mx-auto">
                {lang === 'SW'
                  ? 'Weka kamera zako, taa, drones, sauti, au kuta za LED kuanza kupata mapato ya kukodisha.'
                  : 'Add your cinema cameras, lighting kits, drones, audio packs, or LED screens to start earning rental income.'}
              </p>
              <button
                onClick={onOpenAddGearModal}
                className="bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> {lang === 'SW' ? '+ Orodhesha Kifaa Chako cha Kwanza' : 'Add First Equipment Package'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map(item => (
                <div
                  key={item.id}
                  className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3 space-y-2.5 transition"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'}
                      alt={item.title}
                      className="w-18 h-18 rounded-lg object-cover border border-[#262C3D] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#F5F3EE] text-xs truncate">{item.title}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            item.isPublished
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-700/50 text-zinc-300'
                          }`}
                        >
                          {item.isPublished
                            ? (lang === 'SW' ? 'Kipo Sokoni' : 'Published')
                            : (lang === 'SW' ? 'Kimehifadhiwa / Kipo Nje' : 'Draft / Offline')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#D6AD62]">{getEquipmentCategoryLabel(item.category, lang)}</p>
                      <p className="text-[10px] text-[#A6ADBB]">{item.modelSpecs || item.location}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-[#F5F3EE] text-xs">
                          {item.currency} {item.dailyRate.toLocaleString()} / {lang === 'SW' ? 'kwa siku' : 'day'}
                        </span>
                        {item.depositAmount ? (
                          <span className="text-[10px] text-[#A6ADBB]">
                            {lang === 'SW' ? 'Dhamana:' : 'Deposit:'} {item.currency} {item.depositAmount.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#232838] text-[11px]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        disabled={isUpdating === item.id}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                          item.isPublished
                            ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                            : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                        }`}
                      >
                        {item.isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{item.isPublished ? (lang === 'SW' ? 'Ondoa Sokoni' : 'Unpublish') : (lang === 'SW' ? 'Weka Sokoni' : 'Publish to Market')}</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="bg-[#111827] border border-[#262C3D] hover:border-[#D6AD62] text-[#A6ADBB] hover:text-[#F5F3EE] px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={12} /> {t(lang, 'common.edit')}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteGear(item)}
                      disabled={isUpdating === item.id}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title={t(lang, 'common.delete')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RENTALS & DISPATCH STATUS */}
      {activeTab === 'RENTALS' && (
        <div className="space-y-3">
          {myRentals.length === 0 ? (
            <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-2">
              <Calendar size={32} className="mx-auto text-[#A6ADBB]" />
              <h4 className="text-sm font-bold text-[#F5F3EE]">
                {lang === 'SW' ? 'Hakuna Maombi ya Kukodisha Bado' : 'No Rental Requests Yet'}
              </h4>
              <p className="text-xs text-[#A6ADBB]">
                {lang === 'SW'
                  ? 'Wateja na watengenezaji filamu watakapoomba vifaa vyako, maombi yataonekana hapa.'
                  : 'When filmmakers and clients book your gear, rental requests will appear here with contract details.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRentals.map(rental => (
                <div
                  key={rental.id}
                  className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-[#D6AD62]">{rental.reference}</span>
                      <h4 className="font-bold text-[#F5F3EE] mt-0.5">{rental.title}</h4>
                      <p className="text-[11px] text-[#A6ADBB]">
                        {lang === 'SW' ? 'Kimekodishwa na:' : 'Rented by:'} {rental.clientName} • {rental.clientPhone || (lang === 'SW' ? 'Simu ipo kwenye wasifu' : 'Phone in profile')}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        rental.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : rental.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/20 text-blue-400'
                          : rental.status === 'COMPLETED'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-[#D6AD62]/20 text-[#D6AD62]'
                      }`}
                    >
                      {getBookingStatusLabel(rental.status, lang)}
                    </span>
                  </div>

                  <div className="bg-[#111827] p-2.5 rounded-lg border border-[#232838] text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#A6ADBB]">{lang === 'SW' ? 'Muda Ulioombwa:' : 'Requested Period:'}</span>
                      <span className="text-[#F5F3EE] font-semibold">{rental.duration || rental.serviceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A6ADBB]">{lang === 'SW' ? 'Thamani ya Ukodishaji:' : 'Rental Value:'}</span>
                      <span className="text-[#D6AD62] font-bold">
                        {rental.agreedAmount > 0
                          ? `${rental.currency} ${rental.agreedAmount.toLocaleString()}`
                          : (lang === 'SW' ? 'Inasubiri makadirio' : 'Awaiting quotation')}
                      </span>
                    </div>
                    {rental.depositAmount ? (
                      <div className="flex justify-between text-amber-300 text-[10px]">
                        <span>{lang === 'SW' ? 'Dhamana Inayoshikiliwa:' : 'Security Deposit Hold:'}</span>
                        <span>{rental.currency} {rental.depositAmount?.toLocaleString()}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-[#A6ADBB]">{lang === 'SW' ? 'Eneo la Kupokelea:' : 'Destination:'}</span>
                      <span className="text-[#F5F3EE]">{rental.projectLocation}</span>
                    </div>
                  </div>

                  {/* STATUS WORKFLOW ACTIONS */}
                  <div className="flex justify-end gap-2 pt-1 border-t border-[#232838]">
                    {rental.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onBookingStatusChanged(rental.id, 'CONFIRMED', 'Equipment rental confirmed by owner. Escrow hold active.')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow"
                        >
                          {lang === 'SW' ? 'Kubali & Thibitisha' : 'Accept & Confirm'}
                        </button>
                        <button
                          onClick={() => onBookingStatusChanged(rental.id, 'DISPUTED', 'Declined by equipment owner due to availability.')}
                          className="bg-red-950/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                        >
                          {lang === 'SW' ? 'Kataa' : 'Decline'}
                        </button>
                      </>
                    )}
                    {rental.status === 'CONFIRMED' && (
                      <button
                        onClick={() => onBookingStatusChanged(rental.id, 'IN_PROGRESS', 'Equipment dispatched to client/shoot venue.')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Truck size={12} /> {lang === 'SW' ? 'Kusafirisha Kifaa Seti' : 'Mark Dispatched / On-Set'}
                      </button>
                    )}
                    {rental.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => onBookingStatusChanged(rental.id, 'COMPLETED', 'Equipment safely returned with all accessories. Escrow released.')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 size={12} /> {lang === 'SW' ? 'Kagua & Kamilisha Kurejesha' : 'Confirm Return & Release'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AVAILABILITY CALENDAR */}
      {activeTab === 'CALENDAR' && (
        <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#F5F3EE] text-xs">
              {lang === 'SW' ? 'Ratiba ya Upatikanaji wa Vifaa' : 'Rental Availability Schedule'}
            </span>
            <span className="text-[10px] text-emerald-400">
              {lang === 'SW' ? 'Inajisasisha papo hapo' : 'Real-time sync'}
            </span>
          </div>
          <p className="text-[11px] text-[#A6ADBB]">
            {lang === 'SW'
              ? 'Tarehe zilizohifadhiwa na mikataba iliyothibitishwa huzuiliwa kiotomatiki kuzuia ukodishaji mara mbili.'
              : 'Dates reserved by confirmed bookings are automatically blocked from public client rentals to prevent double-booking.'}
          </p>
          <div className="space-y-2 pt-1">
            {myListings.map(item => {
              const activeGearBookings = bookings.filter(
                b => b.rentalDetails?.equipmentId === item.id && ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)
              );
              return (
                <div key={item.id} className="p-3 bg-[#171A24] rounded-lg border border-[#232838] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#F5F3EE] block">{item.title}</span>
                    <span className="text-[10px] text-[#A6ADBB]">
                      {lang === 'SW' ? 'Kituo cha Kuchukua:' : 'Dispatch:'} {item.location}
                    </span>
                  </div>
                  <div className="text-right">
                    {activeGearBookings.length > 0 ? (
                      <div>
                        <span className="text-[10px] text-amber-300 font-bold block">
                          {lang === 'SW' ? 'Imehifadhiwa Tarehe:' : 'Reserved on Dates:'}
                        </span>
                        {activeGearBookings.map((b, i) => (
                          <span key={i} className="text-[9px] text-[#A6ADBB] block">
                            {b.rentalDetails?.startDate} to {b.rentalDetails?.endDate}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        {lang === 'SW' ? 'Kinapatikana Tarehe Zote' : 'Available for All Dates'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DEPOSIT & TERMS SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-4 space-y-3 text-xs">
          <span className="font-bold text-[#D6AD62] block uppercase tracking-wider text-[11px]">
            {lang === 'SW' ? 'Mipangilio ya Dhamana & Masharti ya Kukodisha' : 'Rental Terms & Security Deposit Settings'}
          </span>
          <p className="text-[11px] text-[#A6ADBB]">
            {lang === 'SW'
              ? 'Sanidi masharti ya kawaida yanayotumika kiotomatiki kwenye mikataba mipya ya vifaa.'
              : 'Configure standard terms automatically applied to new equipment bookings.'}
          </p>

          <div className="space-y-2 pt-1">
            <div>
              <label className="block text-[#A6ADBB] text-[10px] mb-1">
                {lang === 'SW' ? 'Asilimia ya Kawaida ya Dhamana Inayorejeshwa' : 'Standard Refundable Security Deposit Percentage'}
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-[#171A24] border border-[#262C3D] px-3 py-1.5 rounded-lg text-[#F5F3EE] font-bold">
                  {lang === 'SW' ? '10% – 20% ya Thamani ya Kifaa' : '10% – 20% of Equipment Replacement Value'}
                </span>
                <span className="text-[10px] text-[#A6ADBB]">
                  {lang === 'SW' ? '(Hulindwa na Escrow; 0% makato ya jukwaa)' : '(Protected in Escrow; zero platform commission taken)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[#A6ADBB] text-[10px] mb-1">
                {lang === 'SW' ? 'Kituo cha Msingi cha Kuchukua / Kusafirisha' : 'Default Pickup / Dispatch Hub'}
              </label>
              <input
                type="text"
                defaultValue={currentUser.city ? `${currentUser.city}, ${currentUser.country}` : 'Arusha Central Hub'}
                className="w-full bg-[#171A24] border border-[#262C3D] rounded-lg px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A6ADBB] text-[10px] mb-1">
                {lang === 'SW' ? 'Sera ya Matunzo na Uhakiki wa Uharibifu' : 'Damage and Care Policy'}
              </label>
              <textarea
                rows={3}
                defaultValue={
                  lang === 'SW'
                    ? 'Mkodishwaji anawajibika kukagua vifaa wakati wa makabidhiano. Uharibifu wowote au vifaa vinavyopungua vitakatwa kutoka kwenye dhamana kabla ya kurejeshwa.'
                    : 'Renter is responsible for equipment inspection upon handover. Any operational damages or missing accessories are assessed prior to security deposit return.'
                }
                className="w-full bg-[#171A24] border border-[#262C3D] rounded-lg px-3 py-1.5 text-[#F5F3EE] text-xs outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingGear && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 z-50">
          <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-5 max-w-md w-full space-y-3 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#262C3D] pb-2">
              <h3 className="font-bold text-[#F5F3EE] text-sm">
                {lang === 'SW' ? 'Hariri Maelezo ya Kifaa' : 'Edit Equipment Listing'}
              </h3>
              <button onClick={() => setEditingGear(null)} className="text-[#A6ADBB] hover:text-[#F5F3EE] cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-2.5">
              <div>
                <label className="block text-[#A6ADBB] text-[11px] mb-1">
                  {lang === 'SW' ? 'Jina la Kifaa' : 'Title'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A6ADBB] text-[11px] mb-1">
                    {lang === 'SW' ? 'Bei kwa Siku' : 'Daily Rate'} ({editingGear.currency})
                  </label>
                  <input
                    type="number"
                    value={editRate}
                    onChange={e => setEditRate(e.target.value)}
                    required
                    className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A6ADBB] text-[11px] mb-1">
                    {lang === 'SW' ? 'Dhamana ya Usalama' : 'Security Deposit'}
                  </label>
                  <input
                    type="number"
                    value={editDeposit}
                    onChange={e => setEditDeposit(e.target.value)}
                    className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A6ADBB] text-[11px] mb-1">
                  {lang === 'SW' ? 'Vipimo vya Kiufundi' : 'Specifications'}
                </label>
                <input
                  type="text"
                  value={editSpecs}
                  onChange={e => setEditSpecs(e.target.value)}
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A6ADBB] text-[11px] mb-1">
                  {lang === 'SW' ? 'Eneo la Kuchukulia' : 'Dispatch Location'}
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#262C3D] flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating === editingGear.id}
                  className="flex-1 bg-[#D6AD62] text-[#080B14] font-bold py-2 rounded-xl cursor-pointer"
                >
                  {t(lang, 'common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGear(null)}
                  className="px-4 bg-[#111827] text-[#A6ADBB] rounded-xl cursor-pointer"
                >
                  {t(lang, 'common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
