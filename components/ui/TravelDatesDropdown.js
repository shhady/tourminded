'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const TravelDatesDropdown = ({ onChange, value, locale = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dates');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [pendingDateRange, setPendingDateRange] = useState({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [flexibleDuration, setFlexibleDuration] = useState('');
  const [selectedMonths, setSelectedMonths] = useState([]);
  const dropdownRef = useRef(null);

  const months = [
    { value: 'January', label: locale === 'en' ? 'January' : 'يناير' },
    { value: 'February', label: locale === 'en' ? 'February' : 'فبراير' },
    { value: 'March', label: locale === 'en' ? 'March' : 'مارس' },
    { value: 'April', label: locale === 'en' ? 'April' : 'أبريل' },
    { value: 'May', label: locale === 'en' ? 'May' : 'مايو' },
    { value: 'June', label: locale === 'en' ? 'June' : 'يونيو' },
    { value: 'July', label: locale === 'en' ? 'July' : 'يوليو' },
    { value: 'August', label: locale === 'en' ? 'August' : 'أغسطس' },
    { value: 'September', label: locale === 'en' ? 'September' : 'سبتمبر' },
    { value: 'October', label: locale === 'en' ? 'October' : 'أكتوبر' },
    { value: 'November', label: locale === 'en' ? 'November' : 'نوفمبر' },
    { value: 'December', label: locale === 'en' ? 'December' : 'ديسمبر' }
  ];

  const durations = [
    { value: 'weekend', label: locale === 'en' ? 'Weekend' : 'عطلة نهاية الأسبوع' },
    { value: 'week', label: locale === 'en' ? 'Week' : 'أسبوع' },
    { value: 'month', label: locale === 'en' ? 'Month' : 'شهر' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When opening, copy value to pendingDateRange
  useEffect(() => {
    if (isOpen) {
      if (value && value.includes('_to_')) {
        const [start, end] = value.split('_to_');
        setPendingDateRange({ start: new Date(start), end: new Date(end) });
      } else if (value && value.length === 10) {
        setPendingDateRange({ start: new Date(value), end: new Date(value) });
      } else {
        setPendingDateRange({ start: null, end: null });
      }
    }
  }, [isOpen, value]);

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Use local date formatting to avoid timezone issues
  const formatDate = (date) => {
    if (!date) return '';
    // Get local date in YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateInRange = (date) => {
    if (!pendingDateRange.start || !pendingDateRange.end) return false;
    return date >= pendingDateRange.start && date <= pendingDateRange.end && formatDate(pendingDateRange.start) !== formatDate(pendingDateRange.end);
  };

  const isDateSelected = (date) => {
    if (!pendingDateRange.start) return false;
    if (pendingDateRange.start && formatDate(pendingDateRange.start) === formatDate(pendingDateRange.end)) {
      return formatDate(date) === formatDate(pendingDateRange.start);
    }
    return formatDate(date) === formatDate(pendingDateRange.start) || 
           formatDate(date) === formatDate(pendingDateRange.end);
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    // If no start, or both start and end are set (third click), start new selection
    if (!pendingDateRange.start || (pendingDateRange.start && pendingDateRange.end && formatDate(pendingDateRange.start) !== formatDate(pendingDateRange.end))) {
      setPendingDateRange({ start: date, end: date });
    } else if (pendingDateRange.start && formatDate(pendingDateRange.start) === formatDate(pendingDateRange.end)) {
      // If only start is set (single day), set end
      if (date < pendingDateRange.start) {
        setPendingDateRange({ start: date, end: pendingDateRange.start });
      } else {
        setPendingDateRange({ start: pendingDateRange.start, end: date });
      }
    }
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'next') {
        newMonth.setMonth(newMonth.getMonth() + 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() - 1);
      }
      return newMonth;
    });
  };

  const handleFlexibleDurationChange = (duration) => {
    setFlexibleDuration(duration);
  };

  const handleMonthToggle = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const applySelection = () => {
    let result = '';
    if (activeTab === 'dates' && pendingDateRange.start && pendingDateRange.end) {
      result = `${formatDate(pendingDateRange.start)}_to_${formatDate(pendingDateRange.end)}`;
    } else if (activeTab === 'flexible' && flexibleDuration && selectedMonths.length > 0) {
      result = `flexible-${flexibleDuration}-${selectedMonths.join(',')}`;
    }
    setDateRange(pendingDateRange);
    onChange(result);
    setIsOpen(false);
  };

  const cancelSelection = () => {
    setIsOpen(false);
    setPendingDateRange(dateRange);
  };

  const getDisplayText = () => {
    if (value) {
      if (value.startsWith('flexible-')) {
        const parts = value.split('-');
        const duration = parts[1];
        const months = parts[2]?.split(',') || [];
        return `${durations.find(d => d.value === duration)?.label} - ${months.slice(0, 2).join(', ')}${months.length > 2 ? '...' : ''}`;
      } else {
        const [start, end] = value.split('_to_');
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }
    }
    return locale === 'en' ? 'Select dates' : 'اختر التواريخ';
  };

  const renderCalendar = () => {
    const currentDays = getDaysInMonth(currentMonth);

    const dayNames = locale === 'en' 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['أحد', 'اثن', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];

    return (
      <div className="w-full">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => handleMonthChange('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center font-medium text-sm">
            {currentMonth.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          <button
            type="button"
            onClick={() => handleMonthChange('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {currentDays.map((day, index) => (
            <div key={index} className="p-1">
              {day ? (
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isDateDisabled(day)}
                  className={`
                    w-full h-8 rounded-md text-sm font-medium transition-colors
                    ${isDateDisabled(day) 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : isDateSelected(day)
                      ? 'bg-primary-600 text-primary-600 border-2 border-black'
                      : isDateInRange(day)
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              ) : (
                <div className="w-full h-8" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFlexible = () => (
    <div className="space-y-4">
      {/* Duration Selection */}
      <div>
        <h4 className="font-medium text-sm mb-2 text-gray-700">
          {locale === 'en' ? 'Trip Duration' : 'مدة الرحلة'}
        </h4>
        <div className="flex gap-2">
          {durations.map(duration => (
            <button
              key={duration.value}
              type="button"
              onClick={() => handleFlexibleDurationChange(duration.value)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${flexibleDuration === duration.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selection */}
      <div>
        <h4 className="font-medium text-sm mb-2 text-gray-700">
          {locale === 'en' ? 'Select Months' : 'اختر الأشهر'}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {months.map(month => (
            <button
              key={month.value}
              type="button"
              onClick={() => handleMonthToggle(month.value)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedMonths.includes(month.value)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-gray-800 text-sm font-medium mb-2 flex items-center">
        <Calendar className="text-primary-600 mr-2" size={16} />
        <span>{locale === 'en' ? 'Dates' : 'التواريخ'}</span>
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg
          shadow-sm hover:shadow-md transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {getDisplayText()}
            </span>
          </div>
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                cancelSelection();
              }}
              className="ml-2 p-1 hover:bg-gray-100 rounded cursor-pointer inline-flex"
              role="button"
              tabIndex={0}
            >
              <X className="w-4 h-4 text-gray-400" />
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[340px] w-[360px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('dates')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'dates'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {locale === 'en' ? 'Dates' : 'التواريخ'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flexible')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'flexible'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {locale === 'en' ? 'Flexible' : 'مرن'}
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'dates' ? (
              <div className="space-y-4">
                {/* Calendar */}
                {renderCalendar()}

                {/* Selected Range Display */}
                {pendingDateRange.start && pendingDateRange.end && (
                  <div className="text-sm text-gray-600 text-center">
                    {locale === 'en' ? 'Selected:' : 'المحدد:'} {pendingDateRange.start.toLocaleDateString()} - {pendingDateRange.end.toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              renderFlexible()
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={cancelSelection}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {locale === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={applySelection}
                disabled={activeTab === 'dates' ? !pendingDateRange.start : false}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${activeTab === 'dates' && !pendingDateRange.start ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {locale === 'en' ? 'Apply' : 'تطبيق'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelDatesDropdown; 