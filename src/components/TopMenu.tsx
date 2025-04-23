"use client"
import React, { useState } from 'react';
import styles from './topmenu.module.css';
import Image from 'next/image';
import TopMenuItem from './TopMenuItem';
import Link from 'next/link';
import { Session } from 'next-auth';

interface TopMenuClientProps {
  session: Session | null;
}

export function TopMenu({ session }: TopMenuClientProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className={styles.menucontainer}>
      <div className={styles.leftSection}>
        {/* Logo Image */}
        <Link href="/home" passHref>
        <Image
          src={'/img/logo.png'}
          className={styles.logoimg}
          alt="logo"
          width={50}
          height={50}
        />
      </Link>
        {/* Wildstay text */}
        <span className="text-2xl font-extrabold text-white mt-1 ">WILDSTAY</span>
      </div>
      <div className={styles.rightSection}>
        <TopMenuItem title="Booking" pageRef="/booking" />
        <TopMenuItem title="My Booking" pageRef="/mybooking" />
        {/* Dropdown Container */}
        <div className="relative">
          {/* Dropdown Trigger */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-2 text-white relative z-10"
          >
            {session ? 'Account' : 'Sign In'}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              {session ? (
                // Logged-in state
                <div className="py-1">
                  <Link 
                    href="/account" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Account Details
                  </Link>
                  <Link 
                    href="/api/auth/signout" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign Out
                  </Link>
                  
                </div>
              ) : (
                // Logged-out state
                <div className="py-1">
                  <Link 
                    href="/signin" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Register
                  </Link>
              
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
