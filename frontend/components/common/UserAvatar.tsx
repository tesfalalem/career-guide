import React from 'react';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
  role?: string;
}

const ROLE_GRADIENTS: Record<string, [string, string]> = {
  student: ['#2563EB', '#0D9488'],
  teacher: ['#0D9488', '#0F766E'],
  admin:   ['#4F46E5', '#7C3AED'],
  bit:     ['#0284C7', '#0369A1'],
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  size = 40,
  className = '',
  onClick,
  role = 'student',
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [imageUrl]);

  const initial = (name?.trim().charAt(0) || '?').toUpperCase();
  const [from, to] = ROLE_GRADIENTS[role] ?? ROLE_GRADIENTS.student;
  const fontSize = Math.round(size * 0.4);
  const showImage = !!imageUrl && !imgFailed;

  const style: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : undefined,
    flexShrink: 0,
  };

  if (showImage) {
    return (
      <div style={style} className={className} onClick={onClick} title={name}>
        <img
          src={imageUrl!}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize,
        fontWeight: 900,
        color: '#fff',
        userSelect: 'none',
      }}
      className={className}
      onClick={onClick}
      title={name}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
