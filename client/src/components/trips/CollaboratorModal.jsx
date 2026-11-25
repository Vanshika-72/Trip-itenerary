import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { inviteService } from '../../services/inviteService';
import { Mail, UserPlus, Trash2, CheckCircle2, Copy } from 'lucide-react';

export const CollaboratorModal = ({ isOpen, onClose, trip, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const data = await inviteService.inviteCollaborator(trip._id || trip.id, { email, role });
      setSuccessInfo(data.invitation);
      setEmail('');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await inviteService.updateCollaboratorRole(trip._id || trip.id, userId, newRole);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this collaborator from the trip?')) return;
    try {
      await inviteService.removeCollaborator(trip._id || trip.id, userId);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyLink = () => {
    if (successInfo?.inviteUrl) {
      navigator.clipboard.writeText(successInfo.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trip Collaborators" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Invite Form */}
        <form onSubmit={handleSendInvite} className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
            Invite a Friend
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="colleague@example.com"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-32">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-sand-300 bg-white py-2.5 px-3 text-sm text-charcoal-800"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <Button type="submit" loading={loading} icon={UserPlus} className="shrink-0">
              Invite
            </Button>
          </div>

          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

          {/* Invitation Success Alert with Direct Link */}
          {successInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Invitation created for {successInfo.email}!</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-emerald-200 gap-2">
                <span className="font-mono text-charcoal-600 truncate">{successInfo.inviteUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Existing Collaborators List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
            Active Members ({1 + (trip.collaborators?.length || 0)})
          </h4>

          {/* Owner row */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-sand-200 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
                {trip.ownerId?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                  <span>{trip.ownerId?.name || 'Trip Owner'}</span>
                  <Badge variant="forest">Owner</Badge>
                </div>
                <div className="text-xs text-charcoal-500">{trip.ownerId?.email}</div>
              </div>
            </div>
          </div>

          {/* Collaborator rows */}
          {trip.collaborators && trip.collaborators.length > 0 ? (
            trip.collaborators.map((collab) => {
              const u = collab.user;
              const uid = u?._id || u?.id || u;
              return (
                <div
                  key={uid}
                  className="flex items-center justify-between p-3 rounded-xl border border-sand-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sand-200 text-charcoal-800 flex items-center justify-center font-bold text-xs">
                      {u?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">{u?.name || 'Collaborator'}</div>
                      <div className="text-xs text-charcoal-500">{u?.email}</div>
                    </div>
                  </div>

                  {trip.userRole === 'owner' ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={collab.role}
                        onChange={(e) => handleRoleChange(uid, e.target.value)}
                        className="text-xs rounded-lg border border-sand-300 py-1 px-2 text-charcoal-800"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(uid)}
                        className="p-1.5 text-charcoal-400 hover:text-red-600 rounded-lg transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Badge variant={collab.role === 'editor' ? 'amber' : 'default'}>
                      {collab.role}
                    </Badge>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-charcoal-500 italic p-2">
              No additional collaborators yet. Invite someone above to plan together!
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CollaboratorModal;
