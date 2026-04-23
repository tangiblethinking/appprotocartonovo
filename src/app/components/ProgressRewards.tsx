import React from 'react';
import { useCart } from '../store/cart-context';
import { useContent } from '../store/content-context';

interface ProgressRewardsProps {
  variant?: 'mobile' | 'desktop';
}

const DOT = 14;

export function ProgressRewards({ variant = 'mobile' }: ProgressRewardsProps) {
  const { getProductSubtotal, isSignedInMember } = useCart();
  const { get } = useContent();
  const subtotal = getProductSubtotal();

  const allMilestones = [
    { threshold: 35,  label: get('progress.membership'),  id: 'membership' },
    { threshold: 75,  label: get('progress.freeShipping'), id: 'shipping'  },
    { threshold: 150, label: get('progress.freeGift'),     id: 'gift'      },
  ];

  const milestones = isSignedInMember
    ? allMilestones.filter(m => m.id !== 'membership')
    : allMilestones;

  const maxThreshold = milestones[milestones.length - 1]?.threshold ?? 150;
  const lastAchieved = [...milestones].reverse().find(m => subtotal >= m.threshold);
  const rightAmount = lastAchieved ? lastAchieved.threshold : 0;
  const progressPct = Math.min((subtotal / maxThreshold) * 100, 100);

  return (
    <div style={{ width: '100%', paddingTop: '8px', paddingBottom: '4px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>

        {/* Milestone columns — track lives INSIDE here so it never reaches the $ label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, position: 'relative', zIndex: 1 }}>

          {/* Grey background track — scoped to milestone columns only */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${DOT / 2}px`,
            height: '2px',
            transform: 'translateY(-50%)',
            zIndex: 0,
            borderRadius: '2px',
            background: '#d1d5db',
          }} />

          {/* Animated red fill — same scope */}
          <div style={{
            position: 'absolute',
            top: `${DOT / 2}px`,
            left: 0,
            height: '2px',
            transform: 'translateY(-50%)',
            zIndex: 0,
            borderRadius: '2px',
            background: '#C8102E',
            width: `${progressPct}%`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />

          {/* Dots + labels */}
          {milestones.map((m) => {
            const achieved = subtotal >= m.threshold;
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: `${DOT}px`,
                  height: `${DOT}px`,
                  borderRadius: '50%',
                  background: achieved ? '#C8102E' : '#9ca3af',
                  border: `2px solid ${achieved ? '#C8102E' : '#6b7280'}`,
                  boxShadow: `0 0 0 4px #ffffff`,
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  transition: 'background 0.3s ease',
                }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: achieved ? '#C8102E' : '#6b7280', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Amount label — outside milestone div, track never reaches here */}
        <span style={{
          flexShrink: 0,
          marginLeft: '10px',
          fontSize: '15px',
          fontWeight: 700,
          color: rightAmount > 0 ? '#C8102E' : '#6b7280',
          whiteSpace: 'nowrap',
          lineHeight: `${DOT}px`,
        }}>
          ${rightAmount.toFixed(2)}
        </span>

      </div>
    </div>
  );
}
