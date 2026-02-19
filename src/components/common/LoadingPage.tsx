import React from 'react';

type Props = {
  message?: string;
  fullScreen?: boolean;
};

const LoadingPage: React.FC<Props> = ({
  message = 'กำลังโหลด...',
  fullScreen = true,
}) => {
  const wrapperClass = fullScreen
    ? 'flex h-screen items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div className={wrapperClass}>
      <div className="text-center">
        <div className="border-primary mx-auto h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-muted-foreground mt-3">{message}</p>
      </div>
    </div>
  );
};

export default LoadingPage;
