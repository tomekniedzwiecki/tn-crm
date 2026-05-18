// Auth gate — sprawdza session i ładuje ze_staff row.
// Użycie: `await ZE_Auth.require()` na początku każdej protected strony.
window.ZE_Auth = (function() {
  let currentStaff = null;

  async function require() {
    const { data: { session } } = await ZE_SB.auth.getSession();
    if (!session) {
      const ret = encodeURIComponent(location.pathname + location.search);
      location.href = '/zwolnie/login?return=' + ret;
      throw new Error('not_authenticated');
    }
    // Load staff row
    const { data: staff, error } = await ZE_SB
      .from('ze_staff')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error || !staff || !staff.is_active) {
      await ZE_SB.auth.signOut();
      location.href = '/zwolnie/login?reason=no_staff';
      throw new Error('no_staff');
    }
    currentStaff = staff;
    return { session, staff };
  }

  function staff() { return currentStaff; }

  async function logout() {
    await ZE_SB.auth.signOut();
    location.href = '/zwolnie/login';
  }

  return { require, staff, logout };
})();
