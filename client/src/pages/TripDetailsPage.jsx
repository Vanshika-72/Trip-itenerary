import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { activityService } from '../services/activityService';
import { budgetService } from '../services/budgetService';
import { packingService } from '../services/packingService';

import DayTabList from '../components/itinerary/DayTabList';
import DayTimeline from '../components/itinerary/DayTimeline';
import ActivityModal from '../components/itinerary/ActivityModal';
import TripMapView from '../components/maps/TripMapView';
import BudgetOverview from '../components/budget/BudgetOverview';
import BudgetCharts from '../components/budget/BudgetCharts';
import PackingList from '../components/packing/PackingList';
import CollaboratorModal from '../components/trips/CollaboratorModal';

import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';

import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  FileDown,
  Share2,
  Settings,
  Trash2,
  Compass,
  Map as MapIcon,
  PieChart as ChartIcon,
  CheckSquare,
  Copy,
  Check,
  Globe,
  Lock,
} from 'lucide-react';
import { formatDateRange, formatCurrency } from '../utils/formatters';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [packingData, setPackingData] = useState({ items: [], stats: { total: 0, packed: 0, percentage: 0 } });
  
  const [loading, setLoading] = useState(true);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Tabs
  const [mainTab, setMainTab] = useState('itinerary'); // 'itinerary', 'map', 'budget', 'packing'
  const [selectedDay, setSelectedDay] = useState(1);

  // Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityModalDay, setActivityModalDay] = useState(1);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteTripOpen, setIsDeleteTripOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Share state
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // Load All Trip Data
  const loadTripData = useCallback(async () => {
    try {
      const [tripRes, activitiesRes, budgetRes, packingRes] = await Promise.all([
        tripService.getTripById(id),
        activityService.getTripActivities(id),
        budgetService.getTripBudget(id),
        packingService.getTripPacking(id),
      ]);

      setTrip(tripRes);
      setActivities(activitiesRes);
      setBudgetData(budgetRes);
      setPackingData(packingRes);
    } catch (err) {
      setError(err.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  const canEdit = trip?.userRole === 'owner' || trip?.userRole === 'editor';
  const isOwner = trip?.userRole === 'owner';

  // --- Handlers: Activities ---
  const handleOpenAddActivity = (dayNum) => {
    setEditingActivity(null);
    setActivityModalDay(dayNum || selectedDay || 1);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityModalDay(activity.dayNumber);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (activityPayload) => {
    try {
      if (editingActivity) {
        await activityService.updateActivity(editingActivity._id || editingActivity.id, activityPayload);
      } else {
        await activityService.createActivity(id, activityPayload);
      }
      setIsActivityModalOpen(false);
      loadTripData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    try {
      await activityService.deleteActivity(activityToDelete);
      setActivityToDelete(null);
      loadTripData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReorderActivities = async (reorderPayload) => {
    try {
      const updated = await activityService.reorderActivities(id, reorderPayload);
      setActivities(updated);
      // Reload budget summary in background
      budgetService.getTripBudget(id).then(setBudgetData).catch(() => {});
    } catch (err) {
      alert(err.message);
      loadTripData();
    }
  };

  // --- Handlers: Packing ---
  const handleAddPackingItem = async (itemData) => {
    try {
      await packingService.addPackingItem(id, itemData);
      const updated = await packingService.getTripPacking(id);
      setPackingData(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePackingItem = async (itemId, isPacked) => {
    try {
      await packingService.updatePackingItem(id, itemId, { isPacked });
      const updated = await packingService.getTripPacking(id);
      setPackingData(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePackingItem = async (itemId) => {
    try {
      await packingService.deletePackingItem(id, itemId);
      const updated = await packingService.getTripPacking(id);
      setPackingData(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Handlers: PDF Export ---
  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      await tripService.downloadItineraryPdf(id, trip.title);
    } catch (err) {
      alert(err.message || 'PDF generation failed');
    } finally {
      setPdfDownloading(false);
    }
  };

  // --- Handlers: Public Sharing ---
  const handleTogglePublicShare = async (makePublic) => {
    setShareLoading(true);
    try {
      const res = await tripService.togglePublicShare(id, makePublic);
      setTrip((prev) => ({
        ...prev,
        isPublic: res.isPublic,
        shareToken: res.shareToken,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  const publicUrl = trip?.shareToken
    ? `${window.location.origin}/shared/${trip.shareToken}`
    : '';

  const handleCopyShareLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2000);
    }
  };

  // --- Handlers: Delete Trip ---
  const handleDeleteTrip = async () => {
    try {
      await tripService.deleteTrip(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-charcoal-500 font-medium">Opening your travel journal...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">
          {error || 'Trip not found or unauthorized.'}
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const defaultCover =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-sand-200 bg-sand-200 min-h-[260px] md:min-h-[320px] flex flex-col justify-end">
        <img
          src={trip.coverUrl || defaultCover}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultCover;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <Badge variant={trip.userRole === 'owner' ? 'forest' : trip.userRole === 'editor' ? 'amber' : 'default'}>
            Role: {trip.userRole.toUpperCase()}
          </Badge>
          {trip.isPublic ? (
            <Badge variant="purple" className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Public
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1 bg-black/40 text-sand-200 border-white/20">
              <Lock className="w-3 h-3" /> Private
            </Badge>
          )}
        </div>

        {/* Hero Text Content */}
        <div className="relative p-6 sm:p-8 z-10 text-white space-y-3">
          <div className="flex items-center gap-2 text-sand-200 text-xs sm:text-sm font-medium">
            <MapPin className="w-4 h-4 text-sand-300 shrink-0" />
            <span>{trip.destination}</span>
            <span>•</span>
            <Calendar className="w-4 h-4 text-sand-300 shrink-0" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            <span>•</span>
            <span className="font-bold">{trip.totalDays} Days</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight drop-shadow-sm">
            {trip.title}
          </h1>

          {/* Bottom Hero Bar with Budget & Collaborator Avatars */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <Wallet className="w-3.5 h-3.5 text-sand-300" />
                <span>Budget: {formatCurrency(trip.budget, trip.currency)}</span>
              </div>

              {/* Collaborator Avatars */}
              <div
                onClick={() => setIsCollabModalOpen(true)}
                className="flex items-center -space-x-2 cursor-pointer hover:opacity-90 transition"
                title="View collaborators"
              >
                <div className="w-7 h-7 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">
                  {trip.ownerId?.name?.charAt(0) || 'O'}
                </div>
                {trip.collaborators?.slice(0, 3).map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-sand-300 text-charcoal-800 flex items-center justify-center font-bold text-[10px] ring-2 ring-white"
                  >
                    {c.user?.name?.charAt(0) || 'C'}
                  </div>
                ))}
                {trip.collaborators?.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-charcoal-800 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">
                    +{trip.collaborators.length - 3}
                  </div>
                )}
                <span className="ml-3 text-sand-200 font-semibold underline text-xs">
                  {1 + (trip.collaborators?.length || 0)} members
                </span>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={FileDown}
                loading={pdfDownloading}
                onClick={handleDownloadPdf}
                className="bg-white/90 text-charcoal-900 border-none hover:bg-white"
              >
                PDF Itinerary
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={Share2}
                onClick={() => setIsShareModalOpen(true)}
                className="bg-white/90 text-charcoal-900 border-none hover:bg-white"
              >
                Share
              </Button>

              {isOwner && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Settings}
                    onClick={() => navigate(`/trips/${id}/edit`)}
                    className="bg-white/90 text-charcoal-900 border-none hover:bg-white"
                  >
                    Settings
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteTripOpen(true)}
                    className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center justify-between border-b border-sand-200 pb-1">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setMainTab('itinerary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              mainTab === 'itinerary'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-charcoal-600 hover:bg-sand-100'
            }`}
          >
            <Compass className="w-4 h-4" /> Itinerary
          </button>

          <button
            type="button"
            onClick={() => setMainTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              mainTab === 'map'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-charcoal-600 hover:bg-sand-100'
            }`}
          >
            <MapIcon className="w-4 h-4" /> Map View
          </button>

          <button
            type="button"
            onClick={() => setMainTab('budget')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              mainTab === 'budget'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-charcoal-600 hover:bg-sand-100'
            }`}
          >
            <ChartIcon className="w-4 h-4" /> Budget
          </button>

          <button
            type="button"
            onClick={() => setMainTab('packing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              mainTab === 'packing'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-charcoal-600 hover:bg-sand-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Packing ({packingData.stats.packed}/{packingData.stats.total})
          </button>
        </div>
      </div>

      {/* Tab 1: Itinerary */}
      {mainTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Day selection tabs */}
          <DayTabList
            days={trip.days || []}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          <DayTimeline
            days={trip.days || []}
            activities={activities}
            selectedDay={selectedDay}
            currency={trip.currency}
            canEdit={canEdit}
            onAddActivity={handleOpenAddActivity}
            onEditActivity={handleOpenEditActivity}
            onDeleteActivity={(actId) => setActivityToDelete(actId)}
            onReorder={handleReorderActivities}
          />
        </div>
      )}

      {/* Tab 2: Map View */}
      {mainTab === 'map' && (
        <div className="space-y-6">
          <DayTabList
            days={trip.days || []}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          <TripMapView
            activities={activities}
            selectedDay={selectedDay}
            currency={trip.currency}
            destination={trip.destination}
          />
        </div>
      )}

      {/* Tab 3: Budget Analytics */}
      {mainTab === 'budget' && (
        <div className="space-y-8">
          <BudgetOverview budgetData={budgetData} />
          <BudgetCharts budgetData={budgetData} />
        </div>
      )}

      {/* Tab 4: Packing Checklist */}
      {mainTab === 'packing' && (
        <div className="max-w-3xl mx-auto">
          <PackingList
            items={packingData.items || []}
            stats={packingData.stats}
            canEdit={canEdit}
            onAddItem={handleAddPackingItem}
            onToggleItem={handleTogglePackingItem}
            onDeleteItem={handleDeletePackingItem}
          />
        </div>
      )}

      {/* Modals */}
      {/* 1. Add / Edit Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleSaveActivity}
        activity={editingActivity}
        dayNumber={activityModalDay}
        totalDays={trip.totalDays || 1}
        currency={trip.currency}
      />

      {/* 2. Collaborators Modal */}
      <CollaboratorModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        trip={trip}
        onUpdate={loadTripData}
      />

      {/* 3. Public Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Trip Itinerary"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Public sharing generates an unpredictable read-only link. Anyone with this link can view the daily schedule, map locations, and budget without signing in. Private collaborator details remain hidden.
          </p>

          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-charcoal-900">Public Link Status</span>
              <p className="text-[11px] text-charcoal-500">
                {trip.isPublic ? 'Trip is currently public' : 'Trip is currently private'}
              </p>
            </div>
            {isOwner ? (
              <Button
                variant={trip.isPublic ? 'danger' : 'primary'}
                size="sm"
                loading={shareLoading}
                onClick={() => handleTogglePublicShare(!trip.isPublic)}
              >
                {trip.isPublic ? 'Disable Public Access' : 'Enable Public Link'}
              </Button>
            ) : (
              <Badge variant={trip.isPublic ? 'purple' : 'default'}>
                {trip.isPublic ? 'Enabled' : 'Disabled'}
              </Badge>
            )}
          </div>

          {trip.isPublic && publicUrl && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-700">Public Link</label>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-sand-300">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="text-xs text-charcoal-700 bg-transparent flex-1 outline-none font-mono"
                />
                <Button size="sm" onClick={handleCopyShareLink} icon={isShareCopied ? Check : Copy}>
                  {isShareCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 4. Delete Activity Confirm */}
      <ConfirmDialog
        isOpen={Boolean(activityToDelete)}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleConfirmDeleteActivity}
        title="Delete Activity"
        message="Are you sure you want to delete this activity from your itinerary? Remaining items on this day will automatically adjust order."
      />

      {/* 5. Delete Entire Trip Confirm */}
      <ConfirmDialog
        isOpen={isDeleteTripOpen}
        onClose={() => setIsDeleteTripOpen(false)}
        onConfirm={handleDeleteTrip}
        title="Delete Trip"
        message={`Are you sure you want to permanently delete "${trip.title}"? All scheduled activities, packing items, and invitations will be erased immediately.`}
        confirmText="Permanently Delete"
      />
    </div>
  );
};

export default TripDetailsPage;
