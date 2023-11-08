import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconType } from 'react-icons';

interface SidebarLinkProps {
  IconComponent: IconType;
  name: string;
  to: string;
  disabled?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  IconComponent,
  name,
  to,
  disabled,
}) => {
  return (
    <NavLink
      title={name}
      to={to}
      className={({ isActive, isPending }) => {
        const baseClasses =
          'flex md:flex-col md:space-y-2 items-center p-3 space-x-3 md:space-x-0 md:w-1/6 rounded-lg shadow-md dark:shadow-gray-700 select-none';
        const activeClasses = 'bg-blue-500 dark:bg-blue-600 text-white';
        const inactiveClasses =
          'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800';
        const pendingClasses = 'pending';
        const disabledClasses =
          'cursor-not-allowed opacity-50 pointer-events-none';

        if (disabled) {
          return `${baseClasses} ${disabledClasses}`;
        }

        if (isPending) {
          return `${baseClasses} ${pendingClasses}`;
        }

        return isActive
          ? `${baseClasses} ${activeClasses}`
          : `${baseClasses} ${inactiveClasses}`;
      }}
    >
      <IconComponent className="w-6 h-6" />
      <b className="hidden md:block">{name}</b>
    </NavLink>
  );
};

export default SidebarLink;
