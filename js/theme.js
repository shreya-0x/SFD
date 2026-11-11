/**
 * SFD - Theme Management
 */

let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = isDark ? '🌙' : '☀️';
  
  localStorage.setItem('sfd_theme', isDark ? 'dark' : 'light');

  // Re-render active charts with updated theme colors
  if (typeof curPage !== 'undefined') {
    if (curPage === 'finance' && typeof initFinCharts === 'function') initFinCharts();
    if (curPage === 'habits' && typeof updateHabCharts === 'function') updateHabCharts();
    if (curPage === 'goals' && typeof updateGoalCharts === 'function') updateGoalCharts();
    if (curPage === 'analytics' && typeof initAnalyticsCharts === 'function') initAnalyticsCharts();
  }
}

function chartColors() {
  return {
    grid: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)',
    tick: isDark ? '#8892aa' : '#4b5563'
  };
}

// Load saved theme on startup
(function initTheme() {
  const saved = localStorage.getItem('sfd_theme');
  if (saved === 'light') {
    isDark = false;
    document.documentElement.setAttribute('data-theme', 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = '☀️';
  } else {
    isDark = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = '🌙';
  }
})();
