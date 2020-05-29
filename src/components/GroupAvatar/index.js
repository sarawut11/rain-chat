import React from 'react';
import './styles.scss';
import UserAvatar from '../UserAvatar';

function GroupAvatar({ members, groupId }) {
  if (!members.length) return <UserAvatar name="?" size="46" borderRadius="50%" />;
  const willRenderMembers = members.slice(0, 4);
  const avatarRender = willRenderMembers.map(e => {
    const size = `${46 / 2}`;
    return (
      <UserAvatar key={e.user_id} src={e.avatar} name={e.name} size={size} borderRadius="0%" />
    );
  });

  return (
    <div className="groupAvatar">
      {groupId && groupId === 'vitae-rain-group' ? (
        <img src="../../assets/vitae-logo.png" alt="vitae-logo" />
      ) : (
        avatarRender
      )}
    </div>
  );
}

export default GroupAvatar;
