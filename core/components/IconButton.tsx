import React from 'react';
import { IconType } from 'react-icons';
import { classNames } from '../utils/common';

interface IconButtonProps {
  IconComponent: IconType;
  name: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  primary?: boolean;
  small?: boolean;
  danger?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  IconComponent,
  name,
  disabled,
  onClick,
  children,
  primary,
  small,
  danger,
}) => {
  return (
    <button
      title={name}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        'flex h-full items-center rounded-lg shadow-md dark:shadow-gray-700 active:opacity-50',
        small ? 'p-1 space-x-1' : 'space-x-2 p-3',
        disabled && 'disabled:cursor-not-allowed disabled:opacity-60',
        primary
          ? danger
            ? 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-bold'
            : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800'
      )}
    >
      <IconComponent size="1.2rem" />
      {children}
    </button>
  );
};

export default IconButton;
