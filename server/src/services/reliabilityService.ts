import { Project } from '../models/Project';
import { Dispute } from '../models/Dispute';

export interface ReliabilityResult {
  score: number | null; // null if insufficient history
  status: 'insufficient_history' | 'active_score';
  completedProjectsCount: number;
  onTimeMilestoneRate: number;
  approvedDeliverablesCount: number;
  disputesCount: number;
  disputesResolvedCount: number;
  sampleSizeText: string;
  scoringComponents: Array<{
    label: string;
    value: string;
    impact: 'positive' | 'neutral' | 'negative';
  }>;
}

export const calculateCreatorReliability = async (creatorUserId: string): Promise<ReliabilityResult> => {
  const projects = await Project.find({ creatorUserId });
  const completedProjects = projects.filter((p) => p.status === 'completed');

  const disputes = await Dispute.find({
    $or: [{ initiatorUserId: creatorUserId }, { respondentUserId: creatorUserId }],
  });

  const disputesResolved = disputes.filter((d) => d.status === 'resolved');

  let totalMilestones = 0;
  let approvedMilestones = 0;

  projects.forEach((p) => {
    if (p.milestones) {
      p.milestones.forEach((m) => {
        totalMilestones += 1;
        if (m.status === 'approved') {
          approvedMilestones += 1;
        }
      });
    }
  });

  const onTimeMilestoneRate = totalMilestones > 0 ? Math.round((approvedMilestones / totalMilestones) * 100) : 0;

  if (projects.length === 0) {
    return {
      score: null,
      status: 'insufficient_history',
      completedProjectsCount: 0,
      onTimeMilestoneRate: 0,
      approvedDeliverablesCount: 0,
      disputesCount: 0,
      disputesResolvedCount: 0,
      sampleSizeText: 'No completed platform contracts yet',
      scoringComponents: [
        { label: 'Completed Contracts', value: '0', impact: 'neutral' },
        { label: 'Platform History', value: 'New Creator', impact: 'neutral' },
      ],
    };
  }

  // Calculate score (0-100) based on real platform activity
  let baseScore = 70;
  baseScore += Math.min(20, completedProjects.length * 5); // +5 per completed contract up to 20
  baseScore += Math.round((onTimeMilestoneRate / 100) * 10); // +10 for 100% milestone approvals

  if (disputes.length > 0) {
    const unresolvedDisputes = disputes.length - disputesResolved.length;
    baseScore -= unresolvedDisputes * 10;
  }

  const finalScore = Math.max(0, Math.min(100, baseScore));

  return {
    score: finalScore,
    status: 'active_score',
    completedProjectsCount: completedProjects.length,
    onTimeMilestoneRate,
    approvedDeliverablesCount: approvedMilestones,
    disputesCount: disputes.length,
    disputesResolvedCount: disputesResolved.length,
    sampleSizeText: `Based on ${completedProjects.length} completed project contracts & ${totalMilestones} milestones`,
    scoringComponents: [
      { label: 'Completed Contracts', value: `${completedProjects.length}`, impact: 'positive' },
      { label: 'Milestone Approval Rate', value: `${onTimeMilestoneRate}%`, impact: onTimeMilestoneRate >= 80 ? 'positive' : 'neutral' },
      { label: 'Resolved Disputes Ratio', value: `${disputesResolved.length}/${disputes.length}`, impact: disputes.length === 0 ? 'positive' : 'neutral' },
    ],
  };
};
