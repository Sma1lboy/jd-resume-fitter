import React, { useState, useEffect } from 'react';
import { getSettings, setDebugMode } from '../utils/settings';

interface DebugButtonProps {
  className?: string;
}

const DebugButton: React.FC<DebugButtonProps> = ({ className = '' }) => {
  const [isDebug, setIsDebug] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // 加载当前调试状态
  useEffect(() => {
    getSettings().then(settings => {
      setIsDebug(settings.debugMode);
    });
  }, []);

  const toggleDebugMode = async () => {
    const newState = !isDebug;
    setIsDebug(newState);
    
    try {
      await setDebugMode(newState);
      setShowMessage(true);
      
      // 3秒后隐藏提示
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to toggle debug mode:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDebugMode}
        className={`px-3 py-1 text-xs rounded-md ${
          isDebug 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${className}`}
      >
        {isDebug ? '调试: 开启' : '调试: 关闭'}
      </button>
      
      {showMessage && (
        <div className="absolute top-full left-0 mt-2 px-2 py-1 text-xs bg-black text-white rounded whitespace-nowrap">
          {isDebug ? '已开启调试模式' : '已关闭调试模式'}
        </div>
      )}
    </div>
  );
};

export default DebugButton; 