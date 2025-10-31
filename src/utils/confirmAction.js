const confirmAction = (message = 'Are you sure you want to continue?') => {
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
    return true;
  }

  try {
    return window.confirm(message);
  } catch (error) {
    console.error('Confirmation prompt failed:', error);
    return true;
  }
};

export default confirmAction;

