// ============================================
// PROMOTE SELF TO ADMIN - FRONTEND SCRIPT
// ============================================
// Run this in browser console while logged in to promote yourself to admin

const promoteSelfToAdmin = async () => {
  try {
    const token = localStorage.getItem('skillverse_token') ||
                  localStorage.getItem('clerk_token') ||
                  sessionStorage.getItem('skillverse_token');

    if (!token) {
      console.log('❌ No authentication token found. Please log in first.');
      return;
    }

    const response = await fetch('/api/v1/admin/promote-self', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Successfully promoted to admin role!');
      console.log('User:', data.user);
      console.log('You can now access the admin panel at /admin');

      // Update local storage
      const userData = JSON.parse(localStorage.getItem('skillverse_user') || '{}');
      userData.role = 'admin';
      localStorage.setItem('skillverse_user', JSON.stringify(userData));
      localStorage.setItem('skillverse_user_role', 'admin');

      // Reload page to update UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } else {
      console.log('❌ Failed to promote to admin:', data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the function
promoteSelfToAdmin();