import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { inviteService } from '../services/inviteService';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { Compass, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { formatDateRange } from '../utils/formatters';

export const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [successTripId, setSuccessTripId] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const data = await inviteService.getInviteInfo(token);
        setInvitation(data);
      } catch (err) {
        setError(err.message || 'Invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const res = await inviteService.acceptInvite(token);
      setSuccessTripId(res.tripId);
      setTimeout(() => {
        navigate(`/trips/${res.tripId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="py-24 text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-charcoal-500 font-medium">Verifying invitation...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-charcoal-900">
          Invitation Invalid or Expired
        </h2>
        <p className="text-xs text-charcoal-600 leading-relaxed">
          {error || 'This invitation could not be verified. It may have expired or already been accepted.'}
        </p>
        <div className="pt-2">
          <Link to="/dashboard" className="text-xs font-semibold text-forest-800 underline">
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const trip = invitation.trip;
  const isCorrectEmail = user && user.email?.toLowerCase() === invitation.email?.toLowerCase();

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto w-full bg-white rounded-3xl p-8 border border-sand-200 shadow-xl space-y-6">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-forest-800 text-sand-200 flex items-center justify-center shadow-md mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Trip Invitation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-forest-950">
            You're invited to collaborate!
          </h2>
          <p className="text-xs text-charcoal-600">
            <strong>{trip?.ownerId?.name || 'A fellow traveler'}</strong> invited you to join their trip as an{' '}
            <Badge variant="forest">{invitation.role.toUpperCase()}</Badge>
          </p>
        </div>

        {/* Trip Preview Card */}
        <div className="p-4 rounded-2xl border border-sand-200 bg-sand-50/70 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-forest-950 font-serif">{trip?.title}</h3>
              <p className="text-xs text-charcoal-600">{trip?.destination}</p>
            </div>
            {trip?.coverUrl && (
              <img
                src={trip.coverUrl}
                alt={trip.title}
                className="w-16 h-12 rounded-lg object-cover border border-sand-200 shrink-0"
              />
            )}
          </div>
          <div className="text-xs text-charcoal-500 pt-2 border-t border-sand-200">
            Travel dates: {formatDateRange(trip?.startDate, trip?.endDate)}
          </div>
        </div>

        {/* Success Alert */}
        {successTripId && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Invitation accepted! Redirecting you to the trip...</span>
          </div>
        )}

        {/* Actions based on authentication status */}
        {!isAuthenticated ? (
          <div className="space-y-4 pt-2 border-t border-sand-200 text-center">
            <p className="text-xs text-charcoal-600">
              This invitation was sent to <strong className="text-charcoal-900">{invitation.email}</strong>.
              Please log in or register to accept.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/login', { state: { from: { pathname: `/invite/${token}` } } })}
                className="flex-1"
              >
                Log In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/register')}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </div>
        ) : !isCorrectEmail ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-800">
            <p>
              This invitation is for <strong>{invitation.email}</strong>, but you are currently logged in as <strong>{user.email}</strong>.
            </p>
            <p>Please switch accounts to accept this invitation.</p>
          </div>
        ) : (
          <div className="pt-2">
            <Button
              onClick={handleAccept}
              loading={accepting}
              size="lg"
              icon={ArrowRight}
              className="w-full shadow-md"
            >
              Accept Invitation & Join Trip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
